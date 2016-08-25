<a href="https://github.com/dollarshaveclub/postmate">
  <img src="https://dollarshaveclub.github.io/postmate/assets/postmate-v3.svg">
</a>

> A powerful, simple, promise-based `postMessage` library.

[![npm][npm-image]][npm-url]
[![Build Status](https://travis-ci.org/dollarshaveclub/postmate.svg?branch=master)](https://travis-ci.org/dollarshaveclub/postmate)

[npm-image]: https://img.shields.io/npm/v/postmate.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/postmate

_Postmate_ is a promise-based API built on `postMessage`. It allows a parent page
to speak with a child `iFrame` across origins with minimal effort.

You can download the compiled javascript directly [here](/build/postmate.min.js)

* [Features](#features)
* [Installing](#installing)
* [Glossary](#glossary)
* [Usage](#usage)
* [API](#api)
* [Further Reading](#further-reading)
* [License](#license)

***

## Features
* Promise based API for elegant and simple communication
* Secure. Two way parent <-> child handshake, with origin and message validation.
* Child can expose properties, functions, or promises that the parent can retrieve.
* *Zero* dependencies. Provide your own polyfill or abstraction for the `Promise` API if needed
* Lightweight, weighing in at ~ `3kb`

## Installing
```bash
$ npm i postmate # Install via NPM
# or
$ bower i postmate # Install via Bower
```

## Glossary
* **`Parent`**: The **top level** page that will embed an `iFrame`, creating a `Child`
* **`Child`**: The **bottom level** page that exposes information to the `Parent`. This is the `iFrame`s `src`
* **`Consumer API`**: The object that the `Parent` _and_ `Child` exposes to their respective environments

## Usage
The `Parent` begins communication with the `Child`. A handshake is sent, the `Child` responds with
a handshake reply, finishing `Parent` initialization. The two are bound and ready to communicate.

***

**parent.com**
```javascript
// Kick off the handshake with the iFrame
const handshake = new Postmate({
  container: document.getElementById('some-div'), // Element to inject frame into
  url: 'http://child.com/page.html' // Page to load, must have postmate.js. This will also be the origin used for communication.
});

// When parent <-> child handshake is complete, data may be requested from the child
handshake.then(child => {

  // Fetch the height property in child.html and set it to the iFrames height
  child.get('height')
    .then(height => child.frame.style.height = `${height}px`);
});
```

**child.com/page.html**
```javascript
new Postmate.Model({
  // Expose your model to the Parent. Property values may be functions, promises, or regular values
  height: () => document.height || document.body.offsetHeight
});
```

***

## API
> ## `Postmate(options)`
```javascript
new Postmate({
  container: document.body,
  url: 'http://child.com/'
});
```
> This is written in the parent page. Initiates a connection with the child. Returns a Promise that signals when the handshake is complete and communication is ready to begin.

**Returns**: Promise(child)

#### Properties

Name | Type | Description | Default
:--- | :--- | :--- | :---
**`container`** (optional) | `DOM Node Element` | _An element to append the iFrame to_ | `document.body`
**`url`** | `String` | _A URL to load in the iFrame. The origin of this URL will also be used for securing message transport_

***

> ## `Postmate.Model(model)`


> ```javascript
new Postmate.Model({
  // Functions
  height: () => document.height || document.body.offsetHeight,
>  
  // Properties
  foo: "bar",
>  
  // Promises
  data: fetch(new Request('data.json'))
});
```
> This is authored in the child page. Attaches Message Event listeners for a handshake. Once handshake is accepted, an event listener is bound to receive requests from the Parent.

#### Parameters

Name | Type | Description
:--- | :--- | :---
**`model`** | `Object` | _An object of gettable properties to expose to the parent. Value types may be anything accepted in `postMessage`. Promises may also be set as values or returned from functions._

***

> ## `child.get(key, data)`
```javascript
new Postmate({
  container: document.body,
  url: 'http://child.com/'
}).then(child => {
  child.get('something').then(value => console.log(value));
});
```
> Retrieves a value by property from the Childs `model` object.

**Returns**: Promise(value)

#### Parameters

Name | Type | Description
:--- | :--- | :---
**`key`** | `String` | _The string property to lookup in the childs `context`_
**`data`** | `Object` | _Any serializable value or data that you wish to pass to the child for additional information_

***

> ##`child.frame`
```javascript
new Postmate(options).then(child => {
  child.get('height')
    .then(height => child.frame.style.height = `${height}px`);
});
```
> The iFrame Element that the parent is communicating with

## Further Reading

### Handshake and Initialization Flow

The Handshake and ready sequence is as follows:
```
Parent: Loading frame
Parent: Sending handshake
Child: Received handshake from Parent
Child: Sending handshake reply to Parent
Registering consumer: child
Child awaiting messages...
Child Page Ready
Parent: Received handshake reply from Child
Registering consumer: parent
Parent awaiting messages...
Parent Page Ready
```

## License
MIT
