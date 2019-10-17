<a href="https://github.com/dollarshaveclub/postmate">
  <img src="https://dollarshaveclub.github.io/postmate/assets/postmate-v3.svg">
</a>

> A powerful, simple, promise-based `postMessage` iFrame communication library.

[![npm][npm-image]][npm-url]
[![CircleCI](https://circleci.com/gh/dollarshaveclub/postmate.svg?style=svg)](https://circleci.com/gh/dollarshaveclub/postmate)
[![Share](https://img.shields.io/twitter/url/http/shields.io.svg?style=social)](https://twitter.com/home?status=Postmate%3A%20A%20powerful,%20simple,%20promise-based%20postMessage%20library%20https%3A//github.com/dollarshaveclub/postmate%20via%20%40DSCEngineering%20%40javascript)

[npm-image]: https://badge.fury.io/js/postmate.svg
[npm-url]: https://www.npmjs.com/package/postmate

_Postmate_ is a promise-based API built on `postMessage`. It allows a parent page to speak with a child `iFrame` across origins with minimal effort.

You can download the compiled javascript directly [here](/build/postmate.min.js)

* [Features](#features)
* [Installing](#installing)
* [Glossary](#glossary)
* [Usage](#usage)
* [API](#api)
* [Troubleshooting/FAQ](#troubleshootingfaq)
* [License](#license)

***

## Features

[![Greenkeeper badge](https://badges.greenkeeper.io/dollarshaveclub/postmate.svg)](https://greenkeeper.io/)
* Promise-based API for elegant and simple communication.
* Secure two-way parent <-> child handshake, with message validation.
* Child exposes a retrievable `model` object that the parent can access.
* Child emits events that the parent can listen to.
* Parent can `call` functions within a `child`
* *Zero* dependencies. Provide your own polyfill or abstraction for the `Promise` API if needed.
* Lightweight, weighing in at ~ <span class="size">`1.6kb`</span> (minified & gzipped).

NOTE: While the underlying mechanism is [window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage), only iFrame is supported.

## Installing
Postmate can be installed via NPM.

**NPM**
```bash
$ yarn add postmate # Install via Yarn
```

```bash
$ npm i postmate --save # Install via NPM
```

## Glossary
* **`Parent`**: The **top level** page that will embed an `iFrame`, creating a `Child`.
* **`Child`**: The **bottom level** page loaded within the `iFrame`.
* **`Model`**: The object that the `Child` exposes to the `Parent`.
* **`Handshake`**: The process by which the parent frame identifies itself to the child, and vice versa. When a handshake is complete, the two contexts have bound their event listeners and identified one another.

## Usage
1. The `Parent` begins communication with the `Child`. A handshake is sent, the `Child` responds with a handshake reply, finishing `Parent`/`Child` initialization. The two are bound and ready to communicate securely.

2. The `Parent` fetches values from the `Child` by property name. The `Child` can emit messages to the parent. The `Parent` can `call` functions in the `Child` `Model`.

***
### Example

**parent.com**
```javascript
// Kick off the handshake with the iFrame
const handshake = new Postmate({
  container: document.getElementById('some-div'), // Element to inject frame into
  url: 'http://child.com/page.html' // Page to load, must have postmate.js. This will also be the origin used for communication.
  name: 'my-iframe-name', // Set Iframe name attribute. Useful to get `window.name` in the child.
  classListArray: ["myClass"] //Classes to add to the iframe via classList, useful for styling.
});

// When parent <-> child handshake is complete, data may be requested from the child
handshake.then(child => {

  // Fetch the height property in child.html and set it to the iFrames height
  child.get('height')
    .then(height => child.frame.style.height = `${height}px`);

  // Listen to a particular event from the child
  child.on('some-event', data => console.log(data)); // Logs "Hello, World!"
});
```

**child.com/page.html**
```javascript
const handshake = new Postmate.Model({
  // Expose your model to the Parent. Property values may be functions, promises, or regular values
  height: () => document.height || document.body.offsetHeight
});

// When parent <-> child handshake is complete, events may be emitted to the parent
handshake.then(parent => {
  parent.emit('some-event', 'Hello, World!');
});
```

***

## API

> ## `Postmate.debug`

```javascript
// parent.com or child.com
Postmate.debug = true;
new Postmate(options);
```

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| `debug` | `Boolean` | _Set to `true` to enable logging of additional information_ | `false` |

---

> ## `Postmate.Promise`

```javascript
// parent.com or child.com
Postmate.Promise = RSVP.Promise;
new Postmate(options);
```

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| `Promise` | `Object` | _Replace the Promise API that Postmate uses_ | `window.Promise` |

---

> ## `Postmate(options)`

```javascript
// parent.com
new Postmate({
  container: document.body,
  url: 'http://child.com/',
  classListArray: ["myClass"]
  model: { foo: 'bar' }
});
```

> This is written in the parent page.  Creates an iFrame at the specified `url`. Initiates a connection with the child. Returns a Promise that signals when the handshake is complete and communication is ready to begin.

**Returns**: Promise(child)

#### Properties

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| **`container`** (optional) | `DOM Node Element` | _An element to append the iFrame to_ | `document.body`
**`url`** | `String` | _A URL to load in the iFrame. The origin of this URL will also be used for securing message transport_ | none |
**`classListArray`** | `Array` | _An Array to add classes to the iFrame. Useful for styling_ | none |
**`model`** | `Object` | _An object literal to represent the default values of the Childs model_ | none |

---

> ## `Postmate.Model(model)`

```javascript
// child.com
new Postmate.Model({
  // Serializable values
  foo: "bar",
  // Functions
  height: () => document.height || document.body.offsetHeight,
  // Promises
  data: fetch(new Request('data.json'))
});
```

> This is written in the child page. Calling `Postmate.Model` initiates a handshake request listener from the `Child`. Once the handshake is complete, an event listener is bound to receive requests from the `Parent`. The `Child` model is _extended_ from the `model` provided by the `Parent`.

**Returns**: Promise(handshakeMeta)

#### Parameters

| Name | Type | Description | Default |
| --- | --- | --- | --- |
| **`model`** | `Object` | _An object of gettable properties to expose to the parent. Value types may be anything accepted in `postMessage`. Promises may also be set as values or returned from functions._ | `{}` |

---

> ## `child.get(key)`

```javascript
// parent.com
new Postmate({
  container: document.body,
  url: 'http://child.com/'
}).then(child => {
  child.get('something').then(value => console.log(value));
});
```

> Retrieves a value by property name from the `Childs` `model` object.

**Returns**: Promise(value)

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| **`key`** | `String` (required) | _The string property to lookup in the childs `model`_ |

---

> ## `child.call(key, data)`

```javascript
// parent.com
new Postmate({
  container: document.body,
  url: 'http://child.com/'
}).then(child => {
  child.call('sayHi', 'Hello, World!');
});
```

> Calls the function `sayHi` in the `Child` `Model` with the parameter `Hello, World!`

**Returns**: `undefined`

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| **`key`** | `String` (required) | _The string property to lookup in the childs `model`_ |
| **`data`** | `Mixed` | _The optional data to send to the child function_ |

---

> ## `child.destroy()`

```javascript
// parent.com
new Postmate({
  container: document.body,
  url: 'http://child.com/'
}).then(child => child.destroy());
```

> Removes the `iFrame` element and destroys any `message` event listeners

**Returns**: `undefined`

---

> ## `child.frame`

```javascript
new Postmate(options).then(child => {
  child.get('height')
    .then(height => child.frame.style.height = `${height}px`);
});
```

> The iFrame Element that the parent is communicating with

## Troubleshooting/FAQ

### General
#### Why use Promises for an evented API?
> _Promises provide a clear API for fetching data. Using an evented approach often starts backwards. if the parent wants to know the childs height, the child would need to alert the parent, whereas with Postmate, the Parent will request that information from the child in a synchronous-like manner. The child can emit events to the parent as well, for those other use-cases that still need to be handled._

### Silent Parent/Child
#### I've enabled logging but the parent or child is not logging everything.
> _Postmate.debug needs to be set in both the parent and child for each of them to log their respective information_

#### The child does not respond to communication from the Parent
> _Make sure that you have initialized Postmate.Model in your child page._

### Restrictive Communication
#### I want to retrieve information from the parent by the child
> _Postmate (by design) is restrictive in its modes of communication. This enforces a simplistic approach: The parent is responsible for logic contained within the parent, and the child is responsible for logic contained within the child. If you need to retrieve information from parent -> child, consider setting a default `model` in the parent that the child may extend._

#### I want to send messages to the child from the parent
> _This is specifically what the `call` function is for._

### Security
#### What is the Handshake and why do I need one?
> _By default, all `message` events received by any (parent) page can come from any (child) location. This means that the `Parent` must always enforce security within its message event, ensuring that the `child` (origin) is who we expect them to be, that the message is a response from an original request, and that our message is valid. The handshake routine solves this by saving the identities of the child and parent and ensuring that no changes are made to either._

#### How are messages validated?
> _The origin of the request, the message type, the postMessage mime-type, and in some cases the message response, are all verified against the original data made when the handshake was completed._

## License
MIT
