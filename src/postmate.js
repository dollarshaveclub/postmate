
/**
 * The type of messages our frames our sending
 * @type {String}
 */
const MESSAGE_TYPE = 'application/x-postmate-v1+json';

/**
 * A unique message ID that is used to ensure responses are sent to the correct requests
 * @type {Number}
 */
let _messageId = 0;

/**
 * Increments and returns a message ID
 * @return {Number} A unique ID for a message
 */
function messageId() {
  return ++_messageId;
}

/**
 * Postmate logging function that enables/disables via config
 * @param  {Object} ...args Rest Arguments
 */
function log(...args) {
  if (!Postmate.debug) return;
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
  return a.origin || `${a.protocol}//${a.hostname}`;
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
  if (!{
    'handshake-reply': 1,
    call: 1,
    emit: 1,
    reply: 1,
    request: 1,
  }[message.data.postmate]) return false;
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
  return Postmate.Promise.resolve(unwrappedContext);
}

/**
 * Composes an API to be used by the parent
 * @param {Object} info Information on the consumer
 */
class ParentAPI {

  constructor(info) {
    this.parent = info.parent;
    this.frame = info.frame;
    this.child = info.child;
    this.childOrigin = info.childOrigin;

    this.events = {};

    log('Parent: Registering API');
    log('Parent: Awaiting messages...');

    this.listener = (e) => {
      const { data, name } = (((e || {}).data || {}).value || {});
      if (e.data.postmate === 'emit') {
        log(`Parent: Received event emission: ${name}`);
        if (name in this.events) {
          this.events[name].call(this, data);
        }
      }
    };

    this.parent.addEventListener('message', this.listener, false);
    log('Parent: Awaiting event emissions from Child');
  }


  get(property) {
    return new Postmate.Promise((resolve) => {
      // Extract data from response and kill listeners
      const uid = messageId();
      const transact = (e) => {
        if (e.data.uid === uid && e.data.postmate === 'reply') {
          this.parent.removeEventListener('message', transact, false);
          resolve(e.data.value);
        }
      };

      // Prepare for response from Child...
      this.parent.addEventListener('message', transact, false);

      // Then ask child for information
      this.child.postMessage({
        postmate: 'request',
        type: MESSAGE_TYPE,
        property,
        uid,
      }, this.childOrigin);
    });
  }

  call(property, data) {
    // Send information to the child
    this.child.postMessage({
      postmate: 'call',
      type: MESSAGE_TYPE,
      property,
      data,
    }, this.childOrigin);
  }

  on(eventName, callback) {
    this.events[eventName] = callback;
  }

  destroy() {
    log('Parent: Destroying Postmate instance');
    window.removeEventListener('message', this.listener, false);
    this.frame.parentNode.removeChild(this.frame);
  }
}

/**
 * Composes an API to be used by the child
 * @param {Object} info Information on the consumer
 */
class ChildAPI {

  constructor(info) {
    this.model = info.model;
    this.parent = info.parent;
    this.parentOrigin = info.parentOrigin;
    this.child = info.child;

    log('Child: Registering API');
    log('Child: Awaiting messages...');

    this.child.addEventListener('message', (e) => {
      if (!sanitize(e, this.parentOrigin)) return;
      log('Child: Received request', e.data);

      const { property, uid, data } = e.data;

      if (e.data.postmate === 'call') {
        if (property in this.model && typeof this.model[property] === 'function') {
          this.model[property].call(this, data);
        }
        return;
      }

      // Reply to Parent
      resolveValue(this.model, property)
        .then(value => e.source.postMessage({
          property,
          postmate: 'reply',
          type: MESSAGE_TYPE,
          uid,
          value,
        }, e.origin));
    });
  }

  emit(name, data) {
    log(`Child: Emitting Event "${name}"`, data);
    this.parent.postMessage({
      postmate: 'emit',
      type: MESSAGE_TYPE,
      value: {
        name,
        data,
      },
    }, this.parentOrigin);
  }
}

/**
  * The entry point of the Parent.
 * @type {Class}
 */
class Postmate {

  static debug = false;

  // Internet Explorer craps itself
  static Promise = (() => {
    try {
      return window ? window.Promise : Promise;
    } catch (e) {
      return null;
    }
  })();

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
    this.child = this.frame.contentWindow || this.frame.contentDocument.parentWindow;
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
    return new Postmate.Promise((resolve, reject) => {
      const reply = (e) => {
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

      const loaded = () => {
        log('Parent: Sending handshake', { childOrigin });
        setTimeout(() => this.child.postMessage({
          postmate: 'handshake',
          type: MESSAGE_TYPE,
          model: this.model,
        }, childOrigin), 0);
      };

      if (this.frame.attachEvent) {
        this.frame.attachEvent('onload', loaded);
      } else {
        this.frame.onload = loaded;
      }

      log('Parent: Loading frame', { url });
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
    return new Postmate.Promise((resolve, reject) => {
      const shake = (e) => {
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
            Object.assign(this.model, defaults);
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
