/**
  postmate - A powerful, simple, promise-based postMessage library
  @version v1.4.2
  @link https://github.com/dollarshaveclub/postmate
  @author Jacob Kelley <jakie8@gmail.com>
  @license MIT
**/
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.Postmate = factory());
}(this, (function () { 'use strict';

  /**
   * The type of messages our frames our sending
   * @type {String}
   */
  var messsageType = 'application/x-postmate-v1+json';
  /**
   * hasOwnProperty()
   * @type {Function}
   * @return {Boolean}
   */

  var hasOwnProperty = Object.prototype.hasOwnProperty;
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

  var messageId = function messageId() {
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
  /**
   * Ensures that a message is safe to interpret
   * @param  {Object} message       The postmate message being sent
   * @param  {String} allowedOrigin The whitelisted origin
   * @return {Boolean}
   */

  var sanitize = function sanitize(message, allowedOrigin) {
    if (message.origin !== allowedOrigin) return false;
    if (typeof message.data !== 'object') return false;
    if (!('postmate' in message.data)) return false;
    if (message.data.type !== messsageType) return false;
    if (!{
      'handshake-reply': 1,
      call: 1,
      emit: 1,
      reply: 1,
      request: 1
    }[message.data.postmate]) return false;
    return true;
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
      this.events = {};

      {
        log('Parent: Registering API');
        log('Parent: Awaiting messages...');
      }

      this.listener = function (e) {
        var _ref = ((e || {}).data || {}).value || {},
            data = _ref.data,
            name = _ref.name;

        if (e.data.postmate === 'emit') {
          {
            log("Parent: Received event emission: " + name);
          }

          if (name in _this.events) {
            _this.events[name].call(_this, data);
          }
        }
      };

      this.parent.addEventListener('message', this.listener, false);

      {
        log('Parent: Awaiting event emissions from Child');
      }
    }

    var _proto = ParentAPI.prototype;

    _proto.get = function get(property) {
      var _this2 = this;

      return new Postmate.Promise(function (resolve) {
        // Extract data from response and kill listeners
        var uid = messageId();

        var transact = function transact(e) {
          if (e.data.uid === uid && e.data.postmate === 'reply') {
            _this2.parent.removeEventListener('message', transact, false);

            resolve(e.data.value);
          }
        }; // Prepare for response from Child...


        _this2.parent.addEventListener('message', transact, false); // Then ask child for information


        _this2.child.postMessage({
          postmate: 'request',
          type: messsageType,
          property: property,
          uid: uid
        }, _this2.childOrigin);
      });
    };

    _proto.call = function call(property, data) {
      // Send information to the child
      this.child.postMessage({
        postmate: 'call',
        type: messsageType,
        property: property,
        data: data
      }, this.childOrigin);
    };

    _proto.on = function on(eventName, callback) {
      this.events[eventName] = callback;
    };

    _proto.destroy = function destroy() {
      {
        log('Parent: Destroying Postmate instance');
      }

      window.removeEventListener('message', this.listener, false);
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

      {
        log('Child: Registering API');
        log('Child: Awaiting messages...');
      }

      this.child.addEventListener('message', function (e) {
        if (!sanitize(e, _this3.parentOrigin)) return;

        {
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
          return e.source.postMessage({
            property: property,
            postmate: 'reply',
            type: messsageType,
            uid: uid,
            value: value
          }, e.origin);
        });
      });
    }

    var _proto2 = ChildAPI.prototype;

    _proto2.emit = function emit(name, data) {
      {
        log("Child: Emitting Event \"" + name + "\"", data);
      }

      this.parent.postMessage({
        postmate: 'emit',
        type: messsageType,
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
    // eslint-disable-line no-undef
    // Internet Explorer craps itself

    /**
     * Sets options related to the Parent
     * @param {Object} userOptions The element to inject the frame into, and the url
     * @return {Promise}
     */
    function Postmate(_temp) {
      var _ref2 = _temp === void 0 ? userOptions : _temp,
          _ref2$container = _ref2.container,
          container = _ref2$container === void 0 ? typeof container !== 'undefined' ? container : document.body : _ref2$container,
          model = _ref2.model,
          url = _ref2.url;

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
      return new Postmate.Promise(function (resolve, reject) {
        var reply = function reply(e) {
          if (!sanitize(e, childOrigin)) return false;

          if (e.data.postmate === 'handshake-reply') {
            clearInterval(responseInterval);

            {
              log('Parent: Received handshake reply from Child');
            }

            _this4.parent.removeEventListener('message', reply, false);

            _this4.childOrigin = e.origin;

            {
              log('Parent: Saving Child origin', _this4.childOrigin);
            }

            return resolve(new ParentAPI(_this4));
          } // Might need to remove since parent might be receiving different messages
          // from different hosts


          {
            log('Parent: Invalid handshake reply');
          }

          return reject('Failed handshake');
        };

        _this4.parent.addEventListener('message', reply, false);

        var doSend = function doSend() {
          attempt++;

          {
            log("Parent: Sending handshake attempt " + attempt, {
              childOrigin: childOrigin
            });
          }

          _this4.child.postMessage({
            postmate: 'handshake',
            type: messsageType,
            model: _this4.model
          }, childOrigin);

          if (attempt === maxHandshakeRequests) {
            clearInterval(responseInterval);
          }
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

        {
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


  Postmate.debug = false;

  Postmate.Promise = function () {
    try {
      return window ? window.Promise : Promise;
    } catch (e) {
      return null;
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
          if (!e.data.postmate) {
            return;
          }

          if (e.data.postmate === 'handshake') {
            {
              log('Child: Received handshake from Parent');
            }

            _this5.child.removeEventListener('message', shake, false);

            {
              log('Child: Sending handshake reply to Parent');
            }

            e.source.postMessage({
              postmate: 'handshake-reply',
              type: messsageType
            }, e.origin);
            _this5.parentOrigin = e.origin; // Extend model with the one provided by the parent

            var defaults = e.data.model;

            if (defaults) {
              var keys = Object.keys(defaults);

              for (var i = 0; i < keys.length; i++) {
                if (hasOwnProperty.call(defaults, keys[i])) {
                  _this5.model[keys[i]] = defaults[keys[i]];
                }
              }

              {
                log('Child: Inherited and extended model from Parent');
              }
            }

            {
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

  return Postmate;

})));
