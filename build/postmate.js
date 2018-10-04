/**
  postmate - A powerful, simple, promise-based postMessage library
  @version v1.4.4
  @link https://github.com/dollarshaveclub/postmate
  @author Jacob Kelley <jakie8@gmail.com>
  @license MIT
**/
'use strict';

/* eslint-env browser */

/**
 * A flag indicating MessageChannel support
 * @type {Boolean}
 */
var supportsMessageChannel = typeof MessageChannel !== 'undefined';
/**
 * The type of messages our frames our sending
 * @type {String}
 */

var messageType = 'application/x-postmate-v1+json';
/**
 * The maximum number of attempts to send a handshake request to the parent
 * @type {Number}
 */

var maxHandshakeRequests = 5;
/**
 * A unique message ID that is used to ensure responses are sent to the correct requests
 * @type {Number}
 */

var _messageId = 0;
/**
 * Increments and returns a message ID
 * @return {Number} A unique ID for a message
 */

var generateNewMessageId = function generateNewMessageId() {
  return ++_messageId;
};
/**
 * Postmate logging function that enables/disables via config
 * @param  {Object} ...args Rest Arguments
 */

var log = function log() {
  var _console;

  return Postmate.debug ? (_console = console).log.apply(_console, arguments) : null;
}; // eslint-disable-line no-console

/**
 * Takes a URL and returns the origin
 * @param  {String} url The full URL being requested
 * @return {String}     The URLs origin
 */

var resolveOrigin = function resolveOrigin(url) {
  var a = document.createElement('a');
  a.href = url;
  var protocol = a.protocol.length > 4 ? a.protocol : window.location.protocol;
  var host = a.host.length ? a.port === '80' || a.port === '443' ? a.hostname : a.host : window.location.host;
  return a.origin || protocol + "//" + host;
};
var messageTypes = {
  handshake: 1,
  'handshake-reply': 1,
  call: 1,
  emit: 1,
  reply: 1,
  request: 1
  /**
   * Ensures that a message is safe to interpret
   * @param  {Object}          message       The postmate message being sent
   * @param  {String|Boolean}  allowedOrigin The whitelisted origin
   *                                         or false to skip origin check
   * @return {Boolean}
   */

};
var sanitize = function sanitize(message, allowedOrigin) {
  if (!supportsMessageChannel && typeof allowedOrigin === 'string' && message.origin !== allowedOrigin) return false;
  if (typeof message.data !== 'object') return false;
  if (!('postmate' in message.data)) return false;
  if (message.data.type !== messageType) return false;
  if (!messageTypes[message.data.postmate]) return false;
  return true;
};
/**
 * Helper function calling postMessage appropriately based on the target object support
 * @param  {Object} target    Target object - window/port
 * @param  {Object} message   Message to be sent
 * @param  {String} origin    Target's origin
 */

var postMessage = function postMessage(target, message, origin) {
  var isNotDefined;
  target.postMessage(message, supportsMessageChannel ? isNotDefined : origin);
};
/**
 * Takes a model, and searches for a value by the property
 * @param  {Object} model     The dictionary to search against
 * @param  {String} property  A path within a dictionary (i.e. 'window.location.href')
 * @param  {Object} data      Additional information from the get request that is
 *                            passed to functions in the child model
 * @return {Promise}
 */


var resolveValue = function resolveValue(model, property) {
  var unwrappedContext = typeof model[property] === 'function' ? model[property]() : model[property];
  return Postmate.Promise.resolve(unwrappedContext);
};
/**
 * Composes an API to be used by the parent
 * @param {Object} info Information on the consumer
 */

var ParentAPI =
/*#__PURE__*/
function () {
  function ParentAPI(info) {
    var _this = this;

    this.parent = info.parent;
    this.frame = info.frame;
    this.child = info.child;
    this.childOrigin = info.childOrigin;
    this.source = info.source;
    this.events = {};

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Registering API');
    }

    this.listener = function (e) {
      if (!sanitize(e, _this.childOrigin)) return;

      if (e.data.postmate === 'emit') {
        var _e$data$value = e.data.value,
            data = _e$data$value.data,
            name = _e$data$value.name;

        if (process.env.NODE_ENV !== 'production') {
          log("Parent: Received event emission: " + name);
        }

        if (name in _this.events) {
          _this.events[name].call(_this, data);
        }
      }
    };

    this.addMessageListener(this.listener);

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Awaiting event emissions from Child');
    }
  }

  var _proto = ParentAPI.prototype;

  _proto.addMessageListener = function addMessageListener(listener) {
    this.source.addEventListener('message', listener, false);
  };

  _proto.removeMessageListener = function removeMessageListener(listener) {
    this.source.removeEventListener('message', listener, false);
  };

  _proto.get = function get(property) {
    var _this2 = this;

    return new Postmate.Promise(function (resolve) {
      // Extract data from response and kill listeners
      var uid = generateNewMessageId();

      var transact = function transact(e) {
        if (!sanitize(e, _this2.childOrigin)) return;

        if (e.data.uid === uid && e.data.postmate === 'reply') {
          _this2.removeMessageListener(transact);

          resolve(e.data.value);
        }
      }; // Prepare for response from Child...


      _this2.addMessageListener(transact); // Then ask child for information


      postMessage(_this2.source, {
        postmate: 'request',
        type: messageType,
        property: property,
        uid: uid
      }, _this2.childOrigin);
    });
  };

  _proto.call = function call(property, data) {
    // Send information to the child
    postMessage(this.source, {
      postmate: 'call',
      type: messageType,
      property: property,
      data: data
    }, this.childOrigin);
  };

  _proto.on = function on(eventName, callback) {
    this.events[eventName] = callback;
  };

  _proto.destroy = function destroy() {
    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Destroying Postmate instance');
    }

    this.removeMessageListener(this.listener);
    this.frame.parentNode.removeChild(this.frame);
  };

  return ParentAPI;
}();
/**
 * Composes an API to be used by the child
 * @param {Object} info Information on the consumer
 */

var ChildAPI =
/*#__PURE__*/
function () {
  function ChildAPI(info) {
    var _this3 = this;

    this.model = info.model;
    this.parent = info.parent;
    this.parentOrigin = info.parentOrigin;
    this.child = info.child;
    this.source = info.source;

    if (process.env.NODE_ENV !== 'production') {
      log('Child: Registering API');
      log('Child: Awaiting messages...');
    }

    this.source.addEventListener('message', function (e) {
      if (!sanitize(e, _this3.parentOrigin)) return;

      if (process.env.NODE_ENV !== 'production') {
        log('Child: Received request', e.data);
      }

      var _e$data = e.data,
          property = _e$data.property,
          uid = _e$data.uid,
          data = _e$data.data;

      if (e.data.postmate === 'call') {
        if (property in _this3.model && typeof _this3.model[property] === 'function') {
          _this3.model[property].call(_this3, data);
        }

        return;
      } // Reply to Parent


      resolveValue(_this3.model, property).then(function (value) {
        return postMessage(_this3.source, {
          property: property,
          postmate: 'reply',
          type: messageType,
          uid: uid,
          value: value
        }, _this3.parentOrigin);
      });
    });
  }

  var _proto2 = ChildAPI.prototype;

  _proto2.emit = function emit(name, data) {
    if (process.env.NODE_ENV !== 'production') {
      log("Child: Emitting Event \"" + name + "\"", data);
    }

    postMessage(this.source, {
      postmate: 'emit',
      type: messageType,
      value: {
        name: name,
        data: data
      }
    }, this.parentOrigin);
  };

  return ChildAPI;
}();
/**
  * The entry point of the Parent.
 * @type {Class}
 */

var Postmate =
/*#__PURE__*/
function () {
  // Internet Explorer craps itself

  /**
   * Sets options related to the Parent
   * @param {Object} userOptions The element to inject the frame into, and the url
   * @return {Promise}
   */
  function Postmate(_temp) {
    var _ref = _temp === void 0 ? userOptions : _temp,
        _ref$container = _ref.container,
        container = _ref$container === void 0 ? typeof container !== 'undefined' ? container : document.body : _ref$container,
        model = _ref.model,
        url = _ref.url;

    // eslint-disable-line no-undef
    this.parent = window;
    this.frame = document.createElement('iframe');
    container.appendChild(this.frame);
    this.child = this.frame.contentWindow || this.frame.contentDocument.parentWindow;
    this.model = model || {};
    return this.sendHandshake(url);
  }
  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */


  var _proto3 = Postmate.prototype;

  _proto3.sendHandshake = function sendHandshake(url) {
    var _this4 = this;

    var childOrigin = resolveOrigin(url);
    var attempt = 0;
    var responseInterval;
    var removeReplyHandler;
    return new Postmate.Promise(function (resolve, reject) {
      if (supportsMessageChannel) {
        if (process.env.NODE_ENV !== 'production') {
          log("Parent: Supports MessageChannel");
        }
      }

      var replyFrom = function replyFrom(source) {
        var reply = function reply(e) {
          if (!sanitize(e, childOrigin)) return;
          _this4.source = source;

          if (e.data.postmate === 'handshake-reply') {
            clearInterval(responseInterval);

            if (process.env.NODE_ENV !== 'production') {
              log('Parent: Received handshake reply from Child');
            }

            removeHandler();
            _this4.childOrigin = e.origin;

            if (process.env.NODE_ENV !== 'production') {
              log('Parent: Saving Child origin', _this4.childOrigin);
            }

            return resolve(new ParentAPI(_this4));
          } // Might need to remove since parent might be receiving different messages
          // from different hosts


          if (process.env.NODE_ENV !== 'production') {
            log('Parent: Invalid handshake reply');
          }

          return reject('Failed handshake');
        };

        source.addEventListener('message', reply, false);

        var removeHandler = function removeHandler() {
          source.removeEventListener('message', reply, false);
        };

        return removeHandler;
      };

      var doSend = function doSend() {
        if (attempt === maxHandshakeRequests) {
          clearInterval(responseInterval);
          return;
        }

        attempt++;

        if (removeReplyHandler) {
          removeReplyHandler();
        }

        if (process.env.NODE_ENV !== 'production') {
          log("Parent: Sending handshake attempt " + attempt, {
            childOrigin: childOrigin
          });
        }

        var port1, port2;

        if (supportsMessageChannel) {
          var _ref2 = new MessageChannel();

          port1 = _ref2.port1;
          port2 = _ref2.port2;
          removeReplyHandler = replyFrom(port1);
          port1.start();
        } else {
          removeReplyHandler = replyFrom(_this4.parent);
        }

        _this4.child.postMessage({
          postmate: 'handshake',
          type: messageType,
          model: _this4.model
        }, childOrigin, port2 ? [port2] : []);
      };

      var loaded = function loaded() {
        doSend();
        responseInterval = setInterval(doSend, 500);
      };

      if (_this4.frame.attachEvent) {
        _this4.frame.attachEvent('onload', loaded);
      } else {
        _this4.frame.onload = loaded;
      }

      if (process.env.NODE_ENV !== 'production') {
        log('Parent: Loading frame', {
          url: url
        });
      }

      _this4.frame.src = url;
    });
  };

  return Postmate;
}();
/**
 * The entry point of the Child
 * @type {Class}
 */


Postmate.Promise = function () {
  try {
    return window ? window.Promise : Promise;
  } catch (e) {
    return log('Promise: error', e);
  }
}();

Postmate.Model =
/*#__PURE__*/
function () {
  /**
   * Initializes the child, model, parent, and responds to the Parents handshake
   * @param {Object} model Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  function Model(model) {
    this.child = window;
    this.model = model;
    this.parent = this.child.parent;
    return this.sendHandshakeReply();
  }
  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   */


  var _proto4 = Model.prototype;

  _proto4.sendHandshakeReply = function sendHandshakeReply() {
    var _this5 = this;

    return new Postmate.Promise(function (resolve, reject) {
      var shake = function shake(e) {
        if (!sanitize(e, false)) return;

        if (e.data.postmate === 'handshake') {
          if (process.env.NODE_ENV !== 'production') {
            log('Child: Received handshake from Parent');
          }

          _this5.child.removeEventListener('message', shake, false);

          if (process.env.NODE_ENV !== 'production') {
            log('Child: Sending handshake reply to Parent');
          }

          var source = e.source,
              ports = e.ports,
              origin = e.origin;
          var reply = {
            postmate: 'handshake-reply',
            type: messageType
          };

          if (ports && ports.length > 0) {
            var port = ports[0];
            port.postMessage(reply);
            _this5.source = port;
            port.start();
          } else {
            source.postMessage(reply, origin);
            _this5.source = source;
          }

          _this5.parentOrigin = origin; // Extend model with the one provided by the parent

          var defaults = e.data.model;

          if (defaults) {
            Object.keys(defaults).forEach(function (key) {
              _this5.model[key] = defaults[key];
            });

            if (process.env.NODE_ENV !== 'production') {
              log('Child: Inherited and extended model from Parent');
            }
          }

          if (process.env.NODE_ENV !== 'production') {
            log('Child: Saving Parent origin', _this5.parentOrigin);
          }

          return resolve(new ChildAPI(_this5));
        }

        return reject('Handshake Reply Failed');
      };

      _this5.child.addEventListener('message', shake, false);
    });
  };

  return Model;
}();

module.exports = Postmate;
