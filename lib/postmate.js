
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
 * Composes an API namespace for the respective parent or child
 * @param {Object} info Information on the consumer
 */
function ComsumerAPI(info) {
  const { id, context, parent, parentOrigin, frame, child, childOrigin } = info;

  // var target = consumer === 'parent' ? child : parent;
  log(`Registering consumer: "${id}"`);
  if (id === 'parent') {
    log('Parent awaiting messages...');
    return {
      frame,
      get(key, data) {
        return new Promise(resolve => {
          // Extract data from response and kill listeners
          const uid = new Date().getTime();
          const transact = e => {
            if (e.data.uid === uid) {
              parent.removeEventListener('message', transact, false);
              resolve(e.data.value);
            }
          };

          // Prepare for response from Child...
          parent.addEventListener('message', transact, false);

          // Then ask child for information
          child.postMessage({
            data,
            postmate: 'request',
            type: MESSAGE_TYPE,
            key,
            uid,
          }, childOrigin);
        });
      },
    };
  } else if (id === 'child') {
    log('Child awaiting messages...');

    child.addEventListener('message', e => {
      if (!sanitize(e, parentOrigin)) return;
      log('Child received message', e.data);

      const { data, key, uid } = e.data;

      // Reply to Parent
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
 * The entry point of the Child
 * @type {Class}
 */
class Postmate {

  /**
   * [constructor description]
   * @param {Object} context Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  constructor(context) {
    this.id = 'child';
    this.child = window;
    this.context = context;
    this.parent = this.child.parent;
    return this.sendHandshakeReply();
  }

  sendHandshakeReply() {
    return new Promise((resolve, reject) => {
      const shake = e => {
        if (e.data.postmate === 'handshake') {
          log('Child: Received handshake from Parent');
          this.child.removeEventListener('message', shake, false);
          log('Child: Sending handshake reply to Parent');
          e.source.postMessage({
            postmate: 'handshake-reply',
            type: MESSAGE_TYPE,
          }, e.origin);
          this.parentOrigin = e.origin;
          log('Child: Saving Parent origin', this.parentOrigin);
          return resolve(new ComsumerAPI(this));
        }
        return reject('Handshake Reply Failed');
      };
      this.child.addEventListener('message', shake, false);
    });
  }
}

/**
  * The entry point of the Parent.
 * @type {Class}
 */
Postmate.Handshake = class Handshake {

  /**
   * Sets options related to the Parent
   * @param {Object} userOptions The element to inject the frame into, and the url
   * @return {Promise}
   */
  constructor(userOptions) {
    const { container, url } = userOptions;

    this.id = 'parent';
    this.parent = window;
    this.frame = document.createElement('iframe');
    container.appendChild(this.frame);
    this.child = this.frame.contentWindow;

    return this.sendHandshake(url);
  }

  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */
  sendHandshake(url) {
    const childOrigin = resolveOrigin(url);
    return new Promise((resolve, reject) => {
      const reply = e => {
        if (!sanitize(e, childOrigin)) return reject('Invalid message signature');
        if (e.data.postmate === 'handshake-reply') {
          log('Parent: Received handshake reply from Child');
          this.parent.removeEventListener('message', reply, false);
          this.childOrigin = e.origin;
          log('Parent: Saving Child origin', this.childOrigin);
          return resolve(new ComsumerAPI(this));
        }
        log('Parent: Invalid handshake reply');
        return reject('Failed handshake');
      };

      this.parent.addEventListener('message', reply, false);

      this.frame.onload = () => {
        log('Parent: Sending handshake');
        this.child.postMessage({
          postmate: 'handshake',
          type: MESSAGE_TYPE,
        }, childOrigin);
      };

      log('Parent: Loading frame');
      this.frame.src = url;
    });
  }
};

// Export
export default Postmate;
