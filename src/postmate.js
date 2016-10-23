
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

let debug = false;

// Internet Explorer craps itself
let Promise = (() => {
  try {
    return window ? window.Promise : Promise;
  } catch(e) {
    return null;
  }
})();

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
  if (!debug) return;
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
    reply: 1
  }[message.data.postmate]) return false;
  return true;
}

function createCallSender(info, methodNames) {
  const { localName, local, remote, remoteOrigin } = info;

  log(`${localName}: Creating call sender`);

  const createMethodProxy = methodName => {
    return (...args) => {
      log(`${localName}: Sending ${methodName}() call`);
      return new Promise(resolve => {
        // Extract data from response and kill listeners
        const uid = messageId();
        const transact = message => {
          if (!sanitize(message, remoteOrigin)) return;
          if (message.data.uid === uid && message.data.postmate === 'reply') {
            log(`${localName}: Received ${methodName}() reply`);
            local.removeEventListener('message', transact, false);
            resolve(message.data.returnValue);
          }
        };

        local.addEventListener('message', transact, false);
        remote.postMessage({
          postmate: 'call',
          type: MESSAGE_TYPE,
          uid,
          methodName,
          args
        }, remoteOrigin);
      });
    };
  };

  return methodNames.reduce((api, methodName) => {
    api[methodName] = createMethodProxy(methodName);
    return api;
  }, {});
}

function connectCallReceiver(info, methods) {
  const { localName, local, remote, remoteOrigin } = info;

  log(`${localName}: Connecting call receiver`);

  const listener = (message = {}) => {
    if (!sanitize(message, remoteOrigin)) return;
    const { methodName, uid, args } = message.data || {};

    if (message.data.postmate === 'call') {
      log(`${localName}: Received ${methodName}() call`);
      if (methodName in methods) {
        var methodReturnValue = methods[methodName](...args);
        Promise.resolve(methodReturnValue).then(messageReplyValue => {
          log(`${localName}: Sending ${methodName}() reply`);

          remote.postMessage({
            postmate: 'reply',
            type: MESSAGE_TYPE,
            uid,
            returnValue: messageReplyValue,
          }, remoteOrigin);
        });
      }
    }
  };

  local.addEventListener('message', listener, false);

  log(`${localName}: Awaiting calls...`);

  return () => {
    local.removeEventListener('message', listener, false);
  };
}

/**
 * The entry point of the Parent.
 * @type {Function}
 */
export const connectParent = ({ url, container, methods = {} }) => {
  const parent = window;
  const frame = document.createElement('iframe');
  (container || document.body).appendChild(frame);
  const child = frame.contentWindow || frame.contentDocument.parentWindow;

  const childOrigin = resolveOrigin(url);
  return new Promise((resolve, reject) => {
    const reply = e => {
      if (!sanitize(e, childOrigin)) return false;
      if (e.data.postmate === 'handshake-reply') {
        log('Parent: Received handshake reply from Child');
        parent.removeEventListener('message', reply, false);

        log('Parent: Saving Child origin', e.origin);

        const info = {
          localName: 'Parent',
          local: parent,
          remote: child,
          remoteOrigin: e.origin
        };

        const disconnectReceiver = connectCallReceiver(info, methods);
        const api = createCallSender(info, e.data.methodNames);

        api.frame = frame;

        api.destroy = function() {
          disconnectReceiver();
          frame.parentNode.removeChild(frame);
        };

        return resolve(api);
      }

      // Might need to remove since parent might be receiving different messages
      // from different hosts
      log('Parent: Invalid handshake reply');
      return reject('Failed handshake');
    };

    parent.addEventListener('message', reply, false);

    const loaded = () => {
      log('Parent: Sending handshake');
      child.postMessage({
        postmate: 'handshake',
        type: MESSAGE_TYPE,
        methodNames: Object.keys(methods)
      }, childOrigin);
    };

    if (frame.attachEvent){
      frame.attachEvent("onload", loaded);
    } else {
      frame.onload = loaded;
    }

    log('Parent: Loading frame');
    frame.src = url;
  });
};

/**
 * The entry point of the Child
 * @type {Function}
 */
export const connectChild = ({ methods = {} }) => {
  const child = window;
  const parent = child.parent;

  return new Promise((resolve, reject) => {
    const shake = message => {
      if (message.data && message.data.postmate === 'handshake') {
        log('Child: Received handshake from Parent');
        child.removeEventListener('message', shake, false);

        log('Child: Sending handshake reply to Parent');
        message.source.postMessage({
          postmate: 'handshake-reply',
          type: MESSAGE_TYPE,
          methodNames: Object.keys(methods)
        }, message.origin);

        log('Child: Saving Parent origin', message.origin);

        const info = {
          localName: 'Child',
          local: child,
          remote: parent,
          remoteOrigin: message.origin
        };

        connectCallReceiver(info, methods);

        return resolve(createCallSender(info, message.data.methodNames));
      }
      return reject('Child: Handshake Reply Failed');
    };

    child.addEventListener('message', shake, false);
  });
};

export const setDebug = value => debug = value;

export const setPromise = value => Promise = value;
