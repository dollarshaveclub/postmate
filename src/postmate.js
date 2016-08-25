
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
 * Takes a model, and searches for a value by the property
 * @param  {Object} model     The dictionary to search against
 * @param  {String} property  A path within a dictionary (i.e. 'window.location.href')
 * @param  {Object} data      Additional information from the get request that is
 *                            passed to functions in the child model
 * @return {Promise}
 */
function resolveValue(model, property) {
  const unwrappedContext = typeof model[property] === 'function'
    ? model[property]() : model[property];
  return Promise.resolve(unwrappedContext);
}

/**
 * Composes an API to be used by the parent
 * @param {Object} info Information on the consumer
 */
function ParentAPI(info) {
  const { parent, frame, child, childOrigin } = info;
  log('Registering Child API');
  log('Parent awaiting messages...');

  // List of properties being observed
  this.events = {};
  this.listening = false;

  this.frame = frame;
  this.get = property => {
    return new Promise(resolve => {
      // Extract data from response and kill listeners
      const uid = new Date().getTime();
      const transact = e => {
        if (e.data.uid === uid && e.data.postmate === 'reply') {
          parent.removeEventListener('message', transact, false);
          resolve(e.data.value);
        }
      };

      // Prepare for response from Child...
      parent.addEventListener('message', transact, false);

      // Then ask child for information
      child.postMessage({
        postmate: 'request',
        type: MESSAGE_TYPE,
        property,
        uid,
      }, childOrigin);
    });
  };

  this.on = (eventName, callback) => {
    const listen = e => {
      const { data, name } = (((e || {}).data || {}).value || {});
      if (e.data.postmate === 'emit') {
        log(`Parent: Received event emission: ${name}`);
        if (name in this.events) {
          this.events[name].call(this, data);
        }
      }
    };

    // Attach event listener
    if (!this.listening) {
      log('Parent: Awaiting event emissions from Child');
      parent.addEventListener('message', listen, false);
      this.listening = true;
    }

    this.events[eventName] = callback;
  };
}

/**
 * Composes an API to be used by the child
 * @param {Object} info Information on the consumer
 */
function ChildAPI(info) {
  const { model, parent, parentOrigin, child } = info;

  log('Registering Parent API');
  log('Child awaiting messages...');

  child.addEventListener('message', e => {
    if (!sanitize(e, parentOrigin)) return;
    log('Child received message', e.data);

    const { property, uid } = e.data;
    // Reply to Parent
    resolveValue(model, property)
      .then(value => e.source.postMessage({
        property,
        postmate: 'reply',
        type: MESSAGE_TYPE,
        uid,
        value,
      }, e.origin));
  });

  this.model = model;
  this.emit = (name, data) => {
    console.log("EMITTING EVENT", name, data);
    parent.postMessage({
      postmate: 'emit',
      type: MESSAGE_TYPE,
      value: {
        name,
        data,
      },
    }, parentOrigin);
  };
}

/**
  * The entry point of the Parent.
 * @type {Class}
 */
class Postmate {

  /**
   * Sets options related to the Parent
   * @param {Object} userOptions The element to inject the frame into, and the url
   * @return {Promise}
   */
  constructor(userOptions) {
    const { container, url, model } = userOptions;

    this.parent = window;
    this.frame = document.createElement('iframe');
    (container || document.body).appendChild(this.frame);
    this.child = this.frame.contentWindow;
    this.model = model || {};

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
        if (!sanitize(e, childOrigin)) return false;
        if (e.data.postmate === 'handshake-reply') {
          log('Parent: Received handshake reply from Child');
          this.parent.removeEventListener('message', reply, false);
          this.childOrigin = e.origin;
          log('Parent: Saving Child origin', this.childOrigin);
          return resolve(new ParentAPI(this));
        }

        // Might need to remove since parent might be receiving different messages
        // from different hosts
        log('Parent: Invalid handshake reply');
        return reject('Failed handshake');
      };

      this.parent.addEventListener('message', reply, false);
      this.frame.onload = () => {
        log('Parent: Sending handshake');
        this.child.postMessage({
          postmate: 'handshake',
          type: MESSAGE_TYPE,
          model: this.model,
        }, childOrigin);
      };

      log('Parent: Loading frame');
      this.frame.src = url;
    });
  }
}

/**
 * The entry point of the Child
 * @type {Class}
 */
Postmate.Model = class Model {

  /**
   * Initializes the child, model, parent, and responds to the Parents handshake
   * @param {Object} model Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  constructor(model) {
    this.child = window;
    this.model = model;
    this.parent = this.child.parent;
    return this.sendHandshakeReply();
  }

  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   */
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

          // Extend model with the one provided by the parent
          const defaults = e.data.model;
          if (defaults) {
            const keys = Object.keys(defaults);
            for (let i = 0; i < keys.length; i++) {
              if (defaults.hasOwnProperty(keys[i])) {
                this.model[keys[i]] = defaults[keys[i]];
              }
            }
            log('Child: Inherited and extended model from Parent');
          }

          log('Child: Saving Parent origin', this.parentOrigin);
          return resolve(new ChildAPI(this));
        }
        return reject('Handshake Reply Failed');
      };
      this.child.addEventListener('message', shake, false);
    });
  }
};

// Export
export default Postmate;
