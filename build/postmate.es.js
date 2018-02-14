/**
  postmate - A powerful, simple, promise-based postMessage library
  @version v1.3.0
  @link https://github.com/dollarshaveclub/postmate
  @author Jacob Kelley <jakie8@gmail.com>
  @license MIT
**/
function _typeof(e){return(_typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var REACT_ELEMENT_TYPE;function _jsx(e,t,r,n){REACT_ELEMENT_TYPE||(REACT_ELEMENT_TYPE="function"==typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103);var o=e&&e.defaultProps,i=arguments.length-3;if(t||0===i||(t={children:void 0}),t&&o)for(var a in o)void 0===t[a]&&(t[a]=o[a]);else t||(t=o||{});if(1===i)t.children=n;else if(i>1){for(var s=new Array(i),l=0;l<i;l++)s[l]=arguments[l+3];t.children=s}return{$$typeof:REACT_ELEMENT_TYPE,type:e,key:void 0===r?null:""+r,ref:null,props:t,_owner:null}}function _asyncIterator(e){if("function"==typeof Symbol){if(Symbol.asyncIterator){var t=e[Symbol.asyncIterator];if(null!=t)return t.call(e)}if(Symbol.iterator)return e[Symbol.iterator]()}throw new TypeError("Object is not async iterable")}function _AwaitValue(e){this.wrapped=e}function _AsyncGenerator(e){var t,r;function n(t,r){try{var i=e[t](r),a=i.value,s=a instanceof _AwaitValue;Promise.resolve(s?a.wrapped:a).then(function(e){s?n("next",e):o(i.done?"return":"normal",e)},function(e){n("throw",e)})}catch(e){o("throw",e)}}function o(e,o){switch(e){case"return":t.resolve({value:o,done:!0});break;case"throw":t.reject(o);break;default:t.resolve({value:o,done:!1})}(t=t.next)?n(t.key,t.arg):r=null}this._invoke=function(e,o){return new Promise(function(i,a){var s={key:e,arg:o,resolve:i,reject:a,next:null};r?r=r.next=s:(t=r=s,n(e,o))})},"function"!=typeof e.return&&(this.return=void 0)}function _wrapAsyncGenerator(e){return function(){return new _AsyncGenerator(e.apply(this,arguments))}}function _awaitAsyncGenerator(e){return new _AwaitValue(e)}function _asyncGeneratorDelegate(e,t){var r={},n=!1;function o(r,o){return n=!0,o=new Promise(function(t){t(e[r](o))}),{done:!1,value:t(o)}}return"function"==typeof Symbol&&Symbol.iterator&&(r[Symbol.iterator]=function(){return this}),r.next=function(e){return n?(n=!1,e):o("next",e)},"function"==typeof e.throw&&(r.throw=function(e){if(n)throw n=!1,e;return o("throw",e)}),"function"==typeof e.return&&(r.return=function(e){return o("return",e)}),r}function _asyncToGenerator(e){return function(){var t=this,r=arguments;return new Promise(function(n,o){var i=e.apply(t,r);function a(e,t){try{var r=i[e](t),a=r.value}catch(e){return void o(e)}r.done?n(a):Promise.resolve(a).then(s,l)}function s(e){a("next",e)}function l(e){a("throw",e)}s()})}}function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _defineProperties(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}function _createClass(e,t,r){return t&&_defineProperties(e.prototype,t),r&&_defineProperties(e,r),e}function _defineEnumerableProperties(e,t){for(var r in t){(i=t[r]).configurable=i.enumerable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,r,i)}if(Object.getOwnPropertySymbols)for(var n=Object.getOwnPropertySymbols(t),o=0;o<n.length;o++){var i,a=n[o];(i=t[a]).configurable=i.enumerable=!0,"value"in i&&(i.writable=!0),Object.defineProperty(e,a,i)}return e}function _defaults(e,t){for(var r=Object.getOwnPropertyNames(t),n=0;n<r.length;n++){var o=r[n],i=Object.getOwnPropertyDescriptor(t,o);i&&i.configurable&&void 0===e[o]&&Object.defineProperty(e,o,i)}return e}function _defineProperty(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function _extends(){return(_extends=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e}).apply(this,arguments)}function _get(e,t,r){null===e&&(e=Function.prototype);var n=Object.getOwnPropertyDescriptor(e,t);if(void 0===n){var o=Object.getPrototypeOf(e);return null===o?void 0:_get(o,t,r)}if("value"in n)return n.value;var i=n.get;return void 0!==i?i.call(r):void 0}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function");e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}function _inheritsLoose(e,t){e.prototype=Object.create(t.prototype),e.prototype.constructor=e,e.__proto__=t}"function"==typeof Symbol&&Symbol.asyncIterator&&(_AsyncGenerator.prototype[Symbol.asyncIterator]=function(){return this}),_AsyncGenerator.prototype.next=function(e){return this._invoke("next",e)},_AsyncGenerator.prototype.throw=function(e){return this._invoke("throw",e)},_AsyncGenerator.prototype.return=function(e){return this._invoke("return",e)};var _gPO=Object.getPrototypeOf||function(e){return e.__proto__},_sPO=Object.setPrototypeOf||function(e,t){return e.__proto__=t,e},_construct="object"==typeof Reflect&&Reflect.construct||function(e,t,r){var n,o=[null];return o.push.apply(o,t),n=e.bind.apply(e,o),_sPO(new n,r.prototype)},_cache="function"==typeof Map&&new Map;function _wrapNativeSuper(e){if("function"!=typeof e)throw new TypeError("Super expression must either be null or a function");if(void 0!==_cache){if(_cache.has(e))return _cache.get(e);_cache.set(e,t)}function t(){}return t.prototype=Object.create(e.prototype,{constructor:{value:t,enumerable:!1,writeable:!0,configurable:!0}}),_sPO(t,_sPO(function(){return _construct(e,arguments,_gPO(this).constructor)},e))}function _instanceof(e,t){return null!=t&&"undefined"!=typeof Symbol&&t[Symbol.hasInstance]?t[Symbol.hasInstance](e):e instanceof t}function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}function _interopRequireWildcard(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var r in e)if(Object.prototype.hasOwnProperty.call(e,r)){var n=Object.defineProperty&&Object.getOwnPropertyDescriptor?Object.getOwnPropertyDescriptor(e,r):{};n.get||n.set?Object.defineProperty(t,r,n):t[r]=e[r]}return t.default=e,t}function _newArrowCheck(e,t){if(e!==t)throw new TypeError("Cannot instantiate an arrow function")}function _objectDestructuringEmpty(e){if(null==e)throw new TypeError("Cannot destructure undefined")}function _objectWithoutProperties(e,t){if(null==e)return{};var r,n,o={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(o[r]=e[r]);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(n=0;n<a.length;n++)r=a[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(o[r]=e[r])}return o}function _assertThisInitialized(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _possibleConstructorReturn(e,t){if(t&&("object"==typeof t||"function"==typeof t))return t;if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}function _set(e,t,r,n){var o=Object.getOwnPropertyDescriptor(e,t);if(void 0===o){var i=Object.getPrototypeOf(e);null!==i&&_set(i,t,r,n)}else if("value"in o&&o.writable)o.value=r;else{var a=o.set;void 0!==a&&a.call(n,r)}return r}function _sliceIterator(e,t){var r=[],n=!0,o=!1,i=void 0;try{for(var a,s=e[Symbol.iterator]();!(n=(a=s.next()).done)&&(r.push(a.value),!t||r.length!==t);n=!0);}catch(e){o=!0,i=e}finally{try{n||null==s.return||s.return()}finally{if(o)throw i}}return r}function _slicedToArray(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e))return _sliceIterator(e,t);throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _slicedToArrayLoose(e,t){if(Array.isArray(e))return e;if(Symbol.iterator in Object(e)){for(var r,n=[],o=e[Symbol.iterator]();!(r=o.next()).done&&(n.push(r.value),!t||n.length!==t););return n}throw new TypeError("Invalid attempt to destructure non-iterable instance")}function _taggedTemplateLiteral(e,t){return Object.freeze(Object.defineProperties(e,{raw:{value:Object.freeze(t)}}))}function _taggedTemplateLiteralLoose(e,t){return e.raw=t,e}function _temporalRef(e,t){if(e===_temporalUndefined)throw new ReferenceError(t+" is not defined - temporal dead zone");return e}function _readOnlyError(e){throw new Error('"'+e+'" is read-only')}function _classNameTDZError(e){throw new Error('Class "'+e+'" cannot be referenced in computed property keys.')}var _temporalUndefined={};function _toArray(e){return Array.isArray(e)?e:Array.from(e)}function _toConsumableArray(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}return Array.from(e)}function _skipFirstGeneratorNext(e){return function(){var t=e.apply(this,arguments);return t.next(),t}}function _toPropertyKey(e){return"symbol"==typeof e?e:String(e)}function _initializerWarningHelper(e,t){throw new Error("Decorating class property failed. Please ensure that proposal-class-properties is enabled and set to use loose mode. To use proposal-class-properties in spec mode with decorators, wait for the next major version of decorators in stage 2.")}function _initializerDefineProperty(e,t,r,n){r&&Object.defineProperty(e,t,{enumerable:r.enumerable,configurable:r.configurable,writable:r.writable,value:r.initializer?r.initializer.call(n):void 0})}function _applyDecoratedDescriptor(e,t,r,n,o){var i={};return Object.keys(n).forEach(function(e){i[e]=n[e]}),i.enumerable=!!i.enumerable,i.configurable=!!i.configurable,("value"in i||i.initializer)&&(i.writable=!0),i=r.slice().reverse().reduce(function(r,n){return n(e,t,r)||r},i),o&&void 0!==i.initializer&&(i.value=i.initializer?i.initializer.call(o):void 0,i.initializer=void 0),void 0===i.initializer&&(Object.defineProperty(e,t,i),i=null),i}var messsageType="application/x-postmate-v1+json",hasOwnProperty=Object.prototype.hasOwnProperty,maxHandshakeRequests=5,_messageId=0,messageId=function(){return++_messageId},log=function(){var e;return Postmate.debug?(e=console).log.apply(e,arguments):null},resolveOrigin=function(e){var t=document.createElement("a");return t.href=e,t.origin||"".concat(t.protocol,"//").concat(t.hostname)},sanitize=function(e,t){return e.origin===t&&("object"===_typeof(e.data)&&("postmate"in e.data&&(e.data.type===messsageType&&!!{"handshake-reply":1,call:1,emit:1,reply:1,request:1}[e.data.postmate])))},resolveValue=function(e,t){var r="function"==typeof e[t]?e[t]():e[t];return Postmate.Promise.resolve(r)},ParentAPI=function(){function e(t){var r=this;_classCallCheck(this,e),this.parent=t.parent,this.frame=t.frame,this.child=t.child,this.childOrigin=t.childOrigin,this.events={},log("Parent: Registering API"),log("Parent: Awaiting messages..."),this.listener=function(e){var t=((e||{}).data||{}).value||{},n=t.data,o=t.name;"emit"===e.data.postmate&&(log("Parent: Received event emission: ".concat(o)),o in r.events&&r.events[o].call(r,n))},this.parent.addEventListener("message",this.listener,!1),log("Parent: Awaiting event emissions from Child")}return _createClass(e,[{key:"get",value:function(e){var t=this;return new Postmate.Promise(function(r){var n=messageId();t.parent.addEventListener("message",function e(o){o.data.uid===n&&"reply"===o.data.postmate&&(t.parent.removeEventListener("message",e,!1),r(o.data.value))},!1),t.child.postMessage({postmate:"request",type:messsageType,property:e,uid:n},t.childOrigin)})}},{key:"call",value:function(e,t){this.child.postMessage({postmate:"call",type:messsageType,property:e,data:t},this.childOrigin)}},{key:"on",value:function(e,t){this.events[e]=t}},{key:"destroy",value:function(){log("Parent: Destroying Postmate instance"),window.removeEventListener("message",this.listener,!1),this.frame.parentNode.removeChild(this.frame)}}]),e}(),ChildAPI=function(){function e(t){var r=this;_classCallCheck(this,e),this.model=t.model,this.parent=t.parent,this.parentOrigin=t.parentOrigin,this.child=t.child,log("Child: Registering API"),log("Child: Awaiting messages..."),this.child.addEventListener("message",function(e){if(sanitize(e,r.parentOrigin)){log("Child: Received request",e.data);var t=e.data,n=t.property,o=t.uid,i=t.data;"call"!==e.data.postmate?resolveValue(r.model,n).then(function(t){return e.source.postMessage({property:n,postmate:"reply",type:messsageType,uid:o,value:t},e.origin)}):n in r.model&&"function"==typeof r.model[n]&&r.model[n].call(r,i)}})}return _createClass(e,[{key:"emit",value:function(e,t){log('Child: Emitting Event "'.concat(e,'"'),t),this.parent.postMessage({postmate:"emit",type:messsageType,value:{name:e,data:t}},this.parentOrigin)}}]),e}(),Postmate=function(){function e(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:userOptions,r=t.container,n=void 0===r?void 0!==n?n:document.body:r,o=t.model,i=t.url;return _classCallCheck(this,e),this.parent=window,this.frame=document.createElement("iframe"),n.appendChild(this.frame),this.child=this.frame.contentWindow||this.frame.contentDocument.parentWindow,this.model=o||{},this.sendHandshake(i)}return _createClass(e,[{key:"sendHandshake",value:function(t){var r,n=this,o=resolveOrigin(t),i=0;return new e.Promise(function(e,a){n.parent.addEventListener("message",function t(i){return!!sanitize(i,o)&&("handshake-reply"===i.data.postmate?(clearInterval(r),log("Parent: Received handshake reply from Child"),n.parent.removeEventListener("message",t,!1),n.childOrigin=i.origin,log("Parent: Saving Child origin",n.childOrigin),e(new ParentAPI(n))):(log("Parent: Invalid handshake reply"),a("Failed handshake")))},!1);var s=function(){log("Parent: Sending handshake attempt ".concat(++i),{childOrigin:o}),n.child.postMessage({postmate:"handshake",type:messsageType,model:n.model},o),i===maxHandshakeRequests&&clearInterval(r)},l=function(){s(),r=setInterval(s,500)};n.frame.attachEvent?n.frame.attachEvent("onload",l):n.frame.onload=l,log("Parent: Loading frame",{url:t}),n.frame.src=t})}}]),e}();Object.defineProperty(Postmate,"debug",{configurable:!0,enumerable:!0,writable:!0,value:!1}),Object.defineProperty(Postmate,"Promise",{configurable:!0,enumerable:!0,writable:!0,value:function(){try{return window?window.Promise:Promise}catch(e){return null}}()}),Postmate.Model=function(){function e(t){return _classCallCheck(this,e),this.child=window,this.model=t,this.parent=this.child.parent,this.sendHandshakeReply()}return _createClass(e,[{key:"sendHandshakeReply",value:function(){var e=this;return new Postmate.Promise(function(t,r){e.child.addEventListener("message",function n(o){if(o.data.postmate){if("handshake"===o.data.postmate){log("Child: Received handshake from Parent"),e.child.removeEventListener("message",n,!1),log("Child: Sending handshake reply to Parent"),o.source.postMessage({postmate:"handshake-reply",type:messsageType},o.origin),e.parentOrigin=o.origin;var i=o.data.model;if(i){for(var a=Object.keys(i),s=0;s<a.length;s++)hasOwnProperty.call(i,a[s])&&(e.model[a[s]]=i[a[s]]);log("Child: Inherited and extended model from Parent")}return log("Child: Saving Parent origin",e.parentOrigin),t(new ChildAPI(e))}return r("Handshake Reply Failed")}},!1)})}}]),e}();export default Postmate;
