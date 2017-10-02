
/**
 * The type of messages our frames our sending
 * @type {String}
 */
const MESSAGE_TYPE = 'application/x-postmate-v1+json';

/**
 * hasOwnProperty()
 * @type {Function}
 * @return {Boolean}
 */
const hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * The maximum number of attempts to send a handshake request to the parent
 * @type {Number}
 */
const maxHandshakeRequests = 5;

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
  // eslint-disable-next-line
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
  return a.origin || `${a.protocol}//${a.host}`;
}

/**
 * Ensures that a message is safe to interpret
 * @param  {Object} message       The postmate message being sent
 * @param  {String} allowedOrigin The whitelisted origin
 * @return {Boolean}
 */
function sanitize(message, allowedOrigin, messageType) {
  if (message.origin !== allowedOrigin) return false;
  if (typeof message.data !== 'object') return false;
  if (!('postmate' in message.data)) return false;
  if (message.data.type !== messageType) return false;
  if (typeof message.data.postmate === 'object') return true;
  if (!{
    'handshake-reply': 1,
    call: 1,
    emit: 1,
    reply: 1,
    request: 1
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
  const unwrappedContext = typeof model[property] === 'function' ?
    model[property]() : model[property];

  return Promise.resolve(unwrappedContext);
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
    this.messageType = info.messageType;
    this.getIncomingMessage = info.getIncomingMessage.bind(info);
    this.getOutcomingMessage = info.getOutcomingMessage.bind(info);

    this.events = {};

    log('Parent: Registering API');
    log('Parent: Awaiting messages...');

    this.listener = (e) => {
      if (!sanitize(e, this.childOrigin, this.messageType)) return;
      const message = this.getIncomingMessage(e.data);
      const { data, name } = (message.value || {});

      if (message.postmate === 'emit') {
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
    return new Promise((resolve) => {
      // Extract data from response and kill listeners
      const uid = messageId();
      const transact = (e) => {
        if (!sanitize(e, this.childOrigin, this.messageType)) return;
        const message = this.getIncomingMessage(e.data);

        if (message.uid === uid && message.postmate === 'reply') {
          this.parent.removeEventListener('message', transact, false);
          resolve(message.value);
        }
      };

      // Prepare for response from Child...
      this.parent.addEventListener('message', transact, false);

      // Then ask child for information
      this.child.postMessage(this.getOutcomingMessage({
        postmate: 'request',
        property,
        uid
      }), this.childOrigin);
    });
  }

  call(property, data) {
    // Send information to the child
    this.child.postMessage(this.getOutcomingMessage({
      postmate: 'call',
      property,
      data
    }), this.childOrigin);
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
    this.messageType = info.messageType;
    this.getIncomingMessage = info.getIncomingMessage.bind(info);
    this.getOutcomingMessage = info.getOutcomingMessage.bind(info);

    log('Child: Registering API');
    log('Child: Awaiting messages...');

    this.child.addEventListener('message', (e) => {
      if (!sanitize(e, this.parentOrigin, this.messageType)) return;
      const message = this.getIncomingMessage(e.data);

      log('Child: Received request', message);
      const { property, uid, data } = message;

      if (message.postmate === 'call') {
        if (property in this.model && typeof this.model[property] === 'function') {
          this.model[property].call(this, data);
        }
        return;
      }

      // Reply to Parent
      resolveValue(this.model, property)
        .then(value => e.source.postMessage(this.getOutcomingMessage({
          property,
          postmate: 'reply',
          uid,
          value
        }), e.origin));
    });
  }

  emit(name, data) {
    log(`Child: Emitting Event "${name}"`, data);
    this.parent.postMessage(this.getOutcomingMessage({
      postmate: 'emit',
      value: {
        name,
        data
      }
    }), this.parentOrigin);
  }
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
  constructor({ container, url, model, messageType }) {
    this.parent = window;
    this.frame = document.createElement('iframe');
    (container || document.body).appendChild(this.frame);
    this.child = this.frame.contentWindow || this.frame.contentDocument.parentWindow;
    this.model = model || {};
    this.messageType = messageType || MESSAGE_TYPE;

    return this.sendHandshake(url);
  }

  getIncomingMessage(data) {
    return data;
  }

  getOutcomingMessage(data) {
    data.type = this.messageType;
    return data;
  }

  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */
  sendHandshake(url) {
    const childOrigin = resolveOrigin(url);
    const messageType = this.messageType;
    let attempt = 0;
    let responseInterval;

    return new Promise((resolve, reject) => {
      const reply = (e) => {
        if (!sanitize(e, childOrigin, messageType)) return false;

        const message = this.getIncomingMessage(e.data);

        if (message.postmate === 'handshake-reply') {
          clearInterval(responseInterval);
          log('Parent: Received handshake reply from Child');
          this.parent.removeEventListener('message', reply, false);

          this.childOrigin = e.origin;
          log('Parent: Saving Child origin', this.childOrigin);

          this.handleHandshakeData(e.data);

          return resolve(new ParentAPI(this));
        }

        // Might need to remove since parent might be receiving different messages
        // from different hosts
        log('Parent: Invalid handshake reply');
        return reject('Failed handshake');
      };

      this.parent.addEventListener('message', reply, false);

      const request = this.getHandshakeRequest();

      const doSend = () => {
        attempt++;
        log(`Parent: Sending handshake attempt ${attempt}, ${childOrigin}`);
        this.child.postMessage(request, childOrigin);

        if (attempt === maxHandshakeRequests) {
          clearInterval(responseInterval);
        }
      };

      const loaded = () => {
        doSend();
        responseInterval = setInterval(doSend, 500);
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

  getHandshakeRequest() {
    return this.getOutcomingMessage({
      postmate: 'handshake',
      model: this.model
    });
  }

  handleHandshakeData(data) {}
}

Postmate.debug = false;

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
  constructor(model, messageType) {
    this.child = window;
    this.model = model;
    this.parent = this.child.parent;
    this.messageType = messageType || MESSAGE_TYPE;

    return this.sendHandshakeReply();
  }

  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   */
  sendHandshakeReply() {
    return new Promise((resolve, reject) => {
      const shake = (e) => {
        if (!e.data.postmate) {
          return;
        }

        if (e.data.postmate === 'handshake') {
          log('Child: Received handshake from Parent');
          this.child.removeEventListener('message', shake, false);

          log('Child: Inherited and extended model from Parent');
          this.handleHandshakeData(e.data);

          log('Child: Saving Parent origin', e.origin);
          this.parentOrigin = e.origin;

          log('Child: Sending handshake reply to Parent');
          e.source.postMessage(this.getOutcomingMessage(this.getHandshakeResponse()), this.parentOrigin);

          resolve(new ChildAPI(this));
        } else {
          reject('Handshake Reply Failed');
        }
      };

      log('Child: Waiting for handshake from Parent');
      this.child.addEventListener('message', shake, false);
    });
  }

  handleHandshakeData(data) {
    // Extend model with the one provided by the parent
    const defaults = data.model;

    if (defaults) {
      const keys = Object.keys(defaults);

      for (let i = 0; i < keys.length; i++) {
        if (hasOwnProperty.call(defaults, keys[i])) {
          this.model[keys[i]] = defaults[keys[i]];
        }
      }
    }
  }

  getHandshakeResponse() {
    return {
      postmate: 'handshake-reply'
    };
  }

  getIncomingMessage(data) {
    return data;
  }

  getOutcomingMessage(data) {
    data.type = this.messageType;
    return data;
  }
};

// Export
module.exports = Postmate;
