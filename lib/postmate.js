
/**
 * The type of messages our frames our sending
 * @type {String}
 */
const MESSAGE_TYPE = 'application/x-postmate-v1+json';

/**
 * Postmate logging function that enables/disables via config
 * @param  {Object} ...args Rest Arguments
 */
function log(...args) {
  console.log(...args); // eslint-disable-line no-console
}

/**
 * Takes a URL and returns the origin
 * @param  {String} url The full URL being requested
 * @return {String}     The URLs origin
 */
function resolveOrigin(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.origin;
}

/**
 * Ensures that a message is safe to interpret
 * @param  {Object} message       The postmate message being sent
 * @param  {String} allowedOrigin The whitelisted origin
 * @return {Boolean}
 */
function sanitize(message, allowedOrigin) {
  if (message.origin !== allowedOrigin) return false;
  if (typeof message.data !== 'object') return false;
  if (!('postmate' in message.data)) return false;
  if (message.data.type !== MESSAGE_TYPE) return false;
  return true;
}

/**
 * Takes a context, and searches for a value by the key
 * @param  {Object} context The dictionary to search against
 * @param  {String} key     A path within a dictionary (i.e. 'window.location.href')
 * @return {Promise}
 */
function resolveValue(context, key, data) {
  const unwrappedContext = typeof context[key] === 'function' ? context[key](data) : context[key];
  return Promise.resolve(unwrappedContext);
}

/**
 * Composes an API namespace for the respective client or host
 * @param {Object} info Information on the consumer
 */
function Consumer(info) {
  const { id, context, client, clientOrigin, frame, host, hostOrigin } = info;

  // var target = consumer === 'client' ? host : client;
  log('Registering consumer', id);
  if (id === 'client') {
    log('Client awaiting messages...');
    return {
      frame,
      get(key, data) {
        return new Promise(resolve => {
          // Extract data from response and kill listeners
          const uid = new Date().getTime();
          const transact = e => {
            if (e.data.uid === uid) {
              client.removeEventListener('message', transact, false);
              resolve(e.data.value);
            }
          };

          // Prepare for response from Host...
          client.addEventListener('message', transact, false);

          // Then ask host for information
          host.postMessage({
            data,
            postmate: 'request',
            type: MESSAGE_TYPE,
            key,
            uid,
          }, hostOrigin);
        });
      },
    };
  } else if (id === 'host') {
    log('Host awaiting messages...');

    host.addEventListener('message', e => {
      if (!sanitize(e, clientOrigin)) return;
      log('Host received message', e.data);

      const { data, key, uid } = e.data;

      // Reply to Client
      resolveValue(context, key, data)
        .then(value => e.source.postMessage({
          key,
          postmate: 'reply',
          type: MESSAGE_TYPE,
          uid,
          value,
        }, e.origin));
    });
  }
}

/**
 * The entry point of the Host
 * @type {Class}
 */
class Postmate {

  /**
   * [constructor description]
   * @param {Object} context Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  constructor(context) {
    this.id = 'host';
    this.host = window;
    this.context = context;
    this.client = this.host.parent;
    return this.sendHandshakeReply();
  }

  sendHandshakeReply() {
    return new Promise((resolve, reject) => {
      const shake = e => {
        if (e.data.postmate === 'handshake') {
          log('Host: Received handshake from Client');
          this.host.removeEventListener('message', shake, false);
          log('Host: Sending handshake reply to Client');
          e.source.postMessage({
            postmate: 'handshake-reply',
            type: MESSAGE_TYPE,
          }, e.origin);
          this.clientOrigin = e.origin;
          log('Host: Setting Client origin', this.clientOrigin);
          return resolve(new Consumer(this));
        }
        return reject('Handshake Reply Failed');
      };
      this.host.addEventListener('message', shake, false);
    });
  }
}

/**
  * The entry point of the Client.
 * @type {Class}
 */
Postmate.Handshake = class Handshake {

  /**
   * Sets options related to the Client
   * @param {Object} userOptions The element to inject the frame into, and the url
   * @return {Promise}
   */
  constructor(userOptions) {
    const { container, url } = userOptions;

    this.id = 'client';
    this.client = window;
    this.frame = document.createElement('iframe');
    container.appendChild(this.frame);
    this.host = this.frame.contentWindow;

    return this.sendHandshake(url);
  }

  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */
  sendHandshake(url) {
    const hostOrigin = resolveOrigin(url);
    return new Promise((resolve, reject) => {
      const reply = e => {
        if (!sanitize(e, hostOrigin)) return;
        if (e.data.postmate === 'handshake-reply') {
          log('Client: Received handshake reply from Host');
          this.client.removeEventListener('message', reply, false);
          this.hostOrigin = e.origin;
          log('Client: Setting Host origin', this.hostOrigin);
          return resolve(new Consumer(this));
        }
        log('Client: Invalid handshake reply');
        return reject('Failed handshake');
      };

      this.client.addEventListener('message', reply, false);

      this.frame.onload = () => {
        log('Client: Sending handshake');
        this.host.postMessage({
          postmate: 'handshake',
          type: MESSAGE_TYPE,
        }, hostOrigin);
      };

      log('Client: Loading frame');
      this.frame.src = url;
    });
  }
};

// Export
export default Postmate;
