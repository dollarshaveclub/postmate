/**
  postmate - A powerful, simple, promise-based postMessage library
  @version v1.4.0
  @link https://github.com/dollarshaveclub/postmate
  @author Jacob Kelley <jakie8@gmail.com>
  @license MIT
**/
function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

var REACT_ELEMENT_TYPE;

function _jsx(type, props, key, children) {
  if (!REACT_ELEMENT_TYPE) {
    REACT_ELEMENT_TYPE = typeof Symbol === "function" && Symbol.for && Symbol.for("react.element") || 0xeac7;
  }

  var defaultProps = type && type.defaultProps;
  var childrenLength = arguments.length - 3;

  if (!props && childrenLength !== 0) {
    props = {
      children: void 0
    };
  }

  if (props && defaultProps) {
    for (var propName in defaultProps) {
      if (props[propName] === void 0) {
        props[propName] = defaultProps[propName];
      }
    }
  } else if (!props) {
    props = defaultProps || {};
  }

  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = new Array(childrenLength);

    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 3];
    }

    props.children = childArray;
  }

  return {
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key === undefined ? null : '' + key,
    ref: null,
    props: props,
    _owner: null
  };
}

function _asyncIterator(iterable) {
  if (typeof Symbol === "function") {
    if (Symbol.asyncIterator) {
      var method = iterable[Symbol.asyncIterator];
      if (method != null) return method.call(iterable);
    }

    if (Symbol.iterator) {
      return iterable[Symbol.iterator]();
    }
  }

  throw new TypeError("Object is not async iterable");
}

function _AwaitValue(value) {
  this.wrapped = value;
}

function _AsyncGenerator(gen) {
  var front, back;

  function send(key, arg) {
    return new Promise(function (resolve, reject) {
      var request = {
        key: key,
        arg: arg,
        resolve: resolve,
        reject: reject,
        next: null
      };

      if (back) {
        back = back.next = request;
      } else {
        front = back = request;
        resume(key, arg);
      }
    });
  }

  function resume(key, arg) {
    try {
      var result = gen[key](arg);
      var value = result.value;
      var wrappedAwait = value instanceof _AwaitValue;
      Promise.resolve(wrappedAwait ? value.wrapped : value).then(function (arg) {
        if (wrappedAwait) {
          resume("next", arg);
          return;
        }

        settle(result.done ? "return" : "normal", arg);
      }, function (err) {
        resume("throw", err);
      });
    } catch (err) {
      settle("throw", err);
    }
  }

  function settle(type, value) {
    switch (type) {
      case "return":
        front.resolve({
          value: value,
          done: true
        });
        break;

      case "throw":
        front.reject(value);
        break;

      default:
        front.resolve({
          value: value,
          done: false
        });
        break;
    }

    front = front.next;

    if (front) {
      resume(front.key, front.arg);
    } else {
      back = null;
    }
  }

  this._invoke = send;

  if (typeof gen.return !== "function") {
    this.return = undefined;
  }
}

if (typeof Symbol === "function" && Symbol.asyncIterator) {
  _AsyncGenerator.prototype[Symbol.asyncIterator] = function () {
    return this;
  };
}

_AsyncGenerator.prototype.next = function (arg) {
  return this._invoke("next", arg);
};

_AsyncGenerator.prototype.throw = function (arg) {
  return this._invoke("throw", arg);
};

_AsyncGenerator.prototype.return = function (arg) {
  return this._invoke("return", arg);
};

function _wrapAsyncGenerator(fn) {
  return function () {
    return new _AsyncGenerator(fn.apply(this, arguments));
  };
}

function _awaitAsyncGenerator(value) {
  return new _AwaitValue(value);
}

function _asyncGeneratorDelegate(inner, awaitWrap) {
  var iter = {},
      waiting = false;

  function pump(key, value) {
    waiting = true;
    value = new Promise(function (resolve) {
      resolve(inner[key](value));
    });
    return {
      done: false,
      value: awaitWrap(value)
    };
  }

  

  if (typeof Symbol === "function" && Symbol.iterator) {
    iter[Symbol.iterator] = function () {
      return this;
    };
  }

  iter.next = function (value) {
    if (waiting) {
      waiting = false;
      return value;
    }

    return pump("next", value);
  };

  if (typeof inner.throw === "function") {
    iter.throw = function (value) {
      if (waiting) {
        waiting = false;
        throw value;
      }

      return pump("throw", value);
    };
  }

  if (typeof inner.return === "function") {
    iter.return = function (value) {
      return pump("return", value);
    };
  }

  return iter;
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
        args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);

      function step(key, arg) {
        try {
          var info = gen[key](arg);
          var value = info.value;
        } catch (error) {
          reject(error);
          return;
        }

        if (info.done) {
          resolve(value);
        } else {
          Promise.resolve(value).then(_next, _throw);
        }
      }

      function _next(value) {
        step("next", value);
      }

      function _throw(err) {
        step("throw", err);
      }

      _next();
    });
  };
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineEnumerableProperties(obj, descs) {
  for (var key in descs) {
    var desc = descs[key];
    desc.configurable = desc.enumerable = true;
    if ("value" in desc) desc.writable = true;
    Object.defineProperty(obj, key, desc);
  }

  if (Object.getOwnPropertySymbols) {
    var objectSymbols = Object.getOwnPropertySymbols(descs);

    for (var i = 0; i < objectSymbols.length; i++) {
      var sym = objectSymbols[i];
      var desc = descs[sym];
      desc.configurable = desc.enumerable = true;
      if ("value" in desc) desc.writable = true;
      Object.defineProperty(obj, sym, desc);
    }
  }

  return obj;
}

function _defaults(obj, defaults) {
  var keys = Object.getOwnPropertyNames(defaults);

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var value = Object.getOwnPropertyDescriptor(defaults, key);

    if (value && value.configurable && obj[key] === undefined) {
      Object.defineProperty(obj, key, value);
    }
  }

  return obj;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _get(object, property, receiver) {
  if (object === null) object = Function.prototype;
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent === null) {
      return undefined;
    } else {
      return _get(parent, property, receiver);
    }
  } else if ("value" in desc) {
    return desc.value;
  } else {
    var getter = desc.get;

    if (getter === undefined) {
      return undefined;
    }

    return getter.call(receiver);
  }
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

var _gPO = Object.getPrototypeOf || function _gPO(o) {
  return o.__proto__;
};

var _sPO = Object.setPrototypeOf || function _sPO(o, p) {
  o.__proto__ = p;
  return o;
};

var _construct = typeof Reflect === "object" && Reflect.construct || function _construct(Parent, args, Class) {
  var Constructor,
      a = [null];
  a.push.apply(a, args);
  Constructor = Parent.bind.apply(Parent, a);
  return _sPO(new Constructor(), Class.prototype);
};

var _cache = typeof Map === "function" && new Map();

function _wrapNativeSuper(Class) {
  if (typeof Class !== "function") {
    throw new TypeError("Super expression must either be null or a function");
  }

  if (typeof _cache !== "undefined") {
    if (_cache.has(Class)) return _cache.get(Class);

    _cache.set(Class, Wrapper);
  }

  function Wrapper() {}

  Wrapper.prototype = Object.create(Class.prototype, {
    constructor: {
      value: Wrapper,
      enumerable: false,
      writeable: true,
      configurable: true
    }
  });
  return _sPO(Wrapper, _sPO(function Super() {
    return _construct(Class, arguments, _gPO(this).constructor);
  }, Class));
}

function _instanceof(left, right) {
  if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) {
    return right[Symbol.hasInstance](left);
  } else {
    return left instanceof right;
  }
}

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    default: obj
  };
}

function _interopRequireWildcard(obj) {
  if (obj && obj.__esModule) {
    return obj;
  } else {
    var newObj = {};

    if (obj != null) {
      for (var key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};

          if (desc.get || desc.set) {
            Object.defineProperty(newObj, key, desc);
          } else {
            newObj[key] = obj[key];
          }
        }
      }
    }

    newObj.default = obj;
    return newObj;
  }
}

function _newArrowCheck(innerThis, boundThis) {
  if (innerThis !== boundThis) {
    throw new TypeError("Cannot instantiate an arrow function");
  }
}

function _objectDestructuringEmpty(obj) {
  if (obj == null) throw new TypeError("Cannot destructure undefined");
}

function _objectWithoutProperties(source, excluded) {
  if (source == null) return {};
  var target = {};
  var sourceKeys = Object.keys(source);
  var key, i;

  for (i = 0; i < sourceKeys.length; i++) {
    key = sourceKeys[i];
    if (excluded.indexOf(key) >= 0) continue;
    target[key] = source[key];
  }

  if (Object.getOwnPropertySymbols) {
    var sourceSymbolKeys = Object.getOwnPropertySymbols(source);

    for (i = 0; i < sourceSymbolKeys.length; i++) {
      key = sourceSymbolKeys[i];
      if (excluded.indexOf(key) >= 0) continue;
      if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
      target[key] = source[key];
    }
  }

  return target;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _set(object, property, value, receiver) {
  var desc = Object.getOwnPropertyDescriptor(object, property);

  if (desc === undefined) {
    var parent = Object.getPrototypeOf(object);

    if (parent !== null) {
      _set(parent, property, value, receiver);
    }
  } else if ("value" in desc && desc.writable) {
    desc.value = value;
  } else {
    var setter = desc.set;

    if (setter !== undefined) {
      setter.call(receiver, value);
    }
  }

  return value;
}

function _sliceIterator(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _slicedToArray(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    return _sliceIterator(arr, i);
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
}

function _slicedToArrayLoose(arr, i) {
  if (Array.isArray(arr)) {
    return arr;
  } else if (Symbol.iterator in Object(arr)) {
    var _arr = [];

    for (var _iterator = arr[Symbol.iterator](), _step; !(_step = _iterator.next()).done;) {
      _arr.push(_step.value);

      if (i && _arr.length === i) break;
    }

    return _arr;
  } else {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }
}

function _taggedTemplateLiteral(strings, raw) {
  return Object.freeze(Object.defineProperties(strings, {
    raw: {
      value: Object.freeze(raw)
    }
  }));
}

function _taggedTemplateLiteralLoose(strings, raw) {
  strings.raw = raw;
  return strings;
}

function _temporalRef(val, name) {
  if (val === _temporalUndefined) {
    throw new ReferenceError(name + " is not defined - temporal dead zone");
  } else {
    return val;
  }
}

function _readOnlyError(name) {
  throw new Error("\"" + name + "\" is read-only");
}

function _classNameTDZError(name) {
  throw new Error("Class \"" + name + "\" cannot be referenced in computed property keys.");
}

var _temporalUndefined = {};

function _toArray(arr) {
  return Array.isArray(arr) ? arr : Array.from(arr);
}

function _toConsumableArray(arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
}

function _skipFirstGeneratorNext(fn) {
  return function () {
    var it = fn.apply(this, arguments);
    it.next();
    return it;
  };
}

function _toPropertyKey(key) {
  if (typeof key === "symbol") {
    return key;
  } else {
    return String(key);
  }
}

function _initializerWarningHelper(descriptor, context) {
  throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and set to use loose mode. ' + 'To use proposal-class-properties in spec mode with decorators, wait for ' + 'the next major version of decorators in stage 2.');
}

function _initializerDefineProperty(target, property, descriptor, context) {
  if (!descriptor) return;
  Object.defineProperty(target, property, {
    enumerable: descriptor.enumerable,
    configurable: descriptor.configurable,
    writable: descriptor.writable,
    value: descriptor.initializer ? descriptor.initializer.call(context) : void 0
  });
}

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
  var desc = {};
  Object['ke' + 'ys'](descriptor).forEach(function (key) {
    desc[key] = descriptor[key];
  });
  desc.enumerable = !!desc.enumerable;
  desc.configurable = !!desc.configurable;

  if ('value' in desc || desc.initializer) {
    desc.writable = true;
  }

  desc = decorators.slice().reverse().reduce(function (desc, decorator) {
    return decorator(target, property, desc) || desc;
  }, desc);

  if (context && desc.initializer !== void 0) {
    desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
    desc.initializer = undefined;
  }

  if (desc.initializer === void 0) {
    Object['define' + 'Property'](target, property, desc);
    desc = null;
  }

  return desc;
}

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
  return a.origin || "".concat(a.protocol, "//").concat(a.hostname);
};
/**
 * Ensures that a message is safe to interpret
 * @param  {Object} message       The postmate message being sent
 * @param  {String} allowedOrigin The whitelisted origin
 * @return {Boolean}
 */

var sanitize = function sanitize(message, allowedOrigin) {
  if (message.origin !== allowedOrigin) return false;
  if (_typeof(message.data) !== 'object') return false;
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

    _classCallCheck(this, ParentAPI);
    this.parent = info.parent;
    this.frame = info.frame;
    this.child = info.child;
    this.childOrigin = info.childOrigin;
    this.events = {};
    log('Parent: Registering API');
    log('Parent: Awaiting messages...');

    this.listener = function (e) {
      var _ref = ((e || {}).data || {}).value || {},
          data = _ref.data,
          name = _ref.name;

      if (e.data.postmate === 'emit') {
        log("Parent: Received event emission: ".concat(name));

        if (name in _this.events) {
          _this.events[name].call(_this, data);
        }
      }
    };

    this.parent.addEventListener('message', this.listener, false);
    log('Parent: Awaiting event emissions from Child');
  }

  _createClass(ParentAPI, [{
    key: "get",
    value: function get(property) {
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
    }
  }, {
    key: "call",
    value: function call(property, data) {
      // Send information to the child
      this.child.postMessage({
        postmate: 'call',
        type: messsageType,
        property: property,
        data: data
      }, this.childOrigin);
    }
  }, {
    key: "on",
    value: function on(eventName, callback) {
      this.events[eventName] = callback;
    }
  }, {
    key: "destroy",
    value: function destroy() {
      log('Parent: Destroying Postmate instance');
      window.removeEventListener('message', this.listener, false);
      this.frame.parentNode.removeChild(this.frame);
    }
  }]);
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

    _classCallCheck(this, ChildAPI);
    this.model = info.model;
    this.parent = info.parent;
    this.parentOrigin = info.parentOrigin;
    this.child = info.child;
    log('Child: Registering API');
    log('Child: Awaiting messages...');
    this.child.addEventListener('message', function (e) {
      if (!sanitize(e, _this3.parentOrigin)) return;
      log('Child: Received request', e.data);
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

  _createClass(ChildAPI, [{
    key: "emit",
    value: function emit(name, data) {
      log("Child: Emitting Event \"".concat(name, "\""), data);
      this.parent.postMessage({
        postmate: 'emit',
        type: messsageType,
        value: {
          name: name,
          data: data
        }
      }, this.parentOrigin);
    }
  }]);
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
  function Postmate() {
    var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : userOptions,
        _ref2$container = _ref2.container,
        container = _ref2$container === void 0 ? typeof container !== 'undefined' ? container : document.body : _ref2$container,
        model = _ref2.model,
        url = _ref2.url;

    _classCallCheck(this, Postmate);
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


  _createClass(Postmate, [{
    key: "sendHandshake",
    value: function sendHandshake(url) {
      var _this4 = this;

      var childOrigin = resolveOrigin(url);
      var attempt = 0;
      var responseInterval;
      return new Postmate.Promise(function (resolve, reject) {
        var reply = function reply(e) {
          if (!sanitize(e, childOrigin)) return false;

          if (e.data.postmate === 'handshake-reply') {
            clearInterval(responseInterval);
            log('Parent: Received handshake reply from Child');

            _this4.parent.removeEventListener('message', reply, false);

            _this4.childOrigin = e.origin;
            log('Parent: Saving Child origin', _this4.childOrigin);
            return resolve(new ParentAPI(_this4));
          } // Might need to remove since parent might be receiving different messages
          // from different hosts


          log('Parent: Invalid handshake reply');
          return reject('Failed handshake');
        };

        _this4.parent.addEventListener('message', reply, false);

        var doSend = function doSend() {
          attempt++;
          log("Parent: Sending handshake attempt ".concat(attempt), {
            childOrigin: childOrigin
          });

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

        log('Parent: Loading frame', {
          url: url
        });
        _this4.frame.src = url;
      });
    }
  }]);
  return Postmate;
}();
/**
 * The entry point of the Child
 * @type {Class}
 */


Object.defineProperty(Postmate, "debug", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: false
});
Object.defineProperty(Postmate, "Promise", {
  configurable: true,
  enumerable: true,
  writable: true,
  value: function () {
    try {
      return window ? window.Promise : Promise;
    } catch (e) {
      return null;
    }
  }()
});

Postmate.Model =
/*#__PURE__*/
function () {
  /**
   * Initializes the child, model, parent, and responds to the Parents handshake
   * @param {Object} model Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  function Model(model) {
    _classCallCheck(this, Model);
    this.child = window;
    this.model = model;
    this.parent = this.child.parent;
    return this.sendHandshakeReply();
  }
  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   */


  _createClass(Model, [{
    key: "sendHandshakeReply",
    value: function sendHandshakeReply() {
      var _this5 = this;

      return new Postmate.Promise(function (resolve, reject) {
        var shake = function shake(e) {
          if (!e.data.postmate) {
            return;
          }

          if (e.data.postmate === 'handshake') {
            log('Child: Received handshake from Parent');

            _this5.child.removeEventListener('message', shake, false);

            log('Child: Sending handshake reply to Parent');
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

              log('Child: Inherited and extended model from Parent');
            }

            log('Child: Saving Parent origin', _this5.parentOrigin);
            return resolve(new ChildAPI(_this5));
          }

          return reject('Handshake Reply Failed');
        };

        _this5.child.addEventListener('message', shake, false);
      });
    }
  }]);
  return Model;
}();

export default Postmate;
