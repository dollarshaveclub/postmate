<a href="https://github.com/dollarshaveclub/postmate">
  <img src="https://dollarshaveclub.github.io/postmate/assets/postmate.svg">
</a>

> A powerful, simple, promise-based `postMessage` library.

* [Installing](#installing)
* [Glossary](#glossary)
* [Usage](#usage)
* [API](#api)

***

## Installing
```sh
$ npm i postmate # Install via NPM
$ bower i postmate # Install via Bower
```

## Glossary
* **`Parent`**: The **top level** page that will embed an `iFrame`, creating a `Child`
* **`Child`**: The **bottom level** page that will expose information to the `Parent`, the page that is embedded within an `iFrame`
* **`Consumer API`**: The object that the `Parent` _and_ `Child` exposes to their respective environments

## Usage
The `Parent` begins communication with the `Child`. A handshake is sent, the `Child` responds with
a handshake reply, finishing `Parent` initialization. The two are bound and ready to mingle.

***

**parent.com**
```javascript
// Kick off the handshake with the iFrame
const pm = new Postmate.Handshake({
  container: document.getElementById('some-div'), // Element to inject frame into
  url: 'http://child.com/index.html' // Page to load, must have postmate.js. This will also be the origin used for communication.
});

// When parent <-> child handshake is complete, data may be requested from the child
pm.then(child => {

  // Fetch the height property in child.html and set it to the iFrames height
  child.get('height')
    .then(height => child.frame.style.height = `${height}px`);
});
```

**child.com/index.html**
```javascript
new Postmate({
  // Expose your gettable properties. May be functions, promises, or regular values
  height: () => document.height || document.body.offsetHeight
});
```

***

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

## API
