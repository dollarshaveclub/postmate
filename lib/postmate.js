
const MESSAGE_TYPE = 'application/x-postmate-v1+json';

function log(...args) {
  console.log(...args); // eslint-disable-line no-console
}

/**
 * Takes a context, and searches for a value located by the key
 * @param  {Object} context The dictionary to search against
 * @param  {String} key     A path within a dictionary (i.e. 'window.location.href')
 * @return {Promise}
 */
function resolveValue(context, key) {
  const unwrappedContext = typeof context[key] === 'function' ? context[key]() : context[key];
  return Promise.resolve(unwrappedContext);
}

/**
 * Composes an API namespace for the respective client or host
 * @param {Object} data Information on the consumer
 */
function Consumer(data) {
  const { id, context, client, frame, host } = data;
  // this._messageID = 1;

  // var target = consumer === 'client' ? host : client;
  log('Registering consumer', id);
  if (id === 'client') {
    log('Client awaiting messages...');
    return {
      frame,
      get(key) {
        return new Promise(resolve => {
          // Extract data from response and kill listeners
          const transact = e => {
            if (e.data.key === key) {
              client.removeEventListener('message', transact, false);
              resolve(e.data.value);
            }
          };

          // Await response from Host...
          client.addEventListener('message', transact, false);

          // Then ask host for information
          host.postMessage({
            key,
            type: MESSAGE_TYPE,
          }, host.location.origin);
        });
      },
    };
  } else if (id === 'host') {
    log('Host awaiting messages...');

    host.addEventListener('message', e => {
      if (e.origin !== client.location.origin) return;

      log('Host received message', e.data);
      const key = e.data.key;

      // Reply to Client
      resolveValue(context, e.data.key)
        .then(value => e.source.postMessage({
          key,
          value,
          type: MESSAGE_TYPE,
        }, e.origin));
    });

    return {};
  }
}

// HOST
function Postmate(context) {
  this.id = 'host';
  this.host = window;
  this.context = context;
  this.client = this.host.parent;

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
        return resolve(new Consumer(this));
      }
      return reject('Handshake Reply Failed');
    };
    this.host.addEventListener('message', shake, false);
  });
}


Postmate.Handshake = function Handshake(userOptions) {
  const { container, url } = userOptions;

  // if ('debug' in userOptions) {
  //   debug = userOptions.debug;
  // }

  this.id = 'client';
  this.client = window;
  this.frame = document.createElement('iframe');
  container.appendChild(this.frame);
  this.host = this.frame.contentWindow;

  return new Promise((resolve, reject) => {
    const reply = e => {
      if (e.data.postmate === 'handshake-reply') {
        log('Client: Received handshake reply from Host');
        this.client.removeEventListener('message', reply, false);
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
      }, '*');
    };

    log('Client: Loading frame');
    this.frame.src = url;
  });
};

export default Postmate;
