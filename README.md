<a href="http://dollarshaveclub.github.io/postmate/pages/">
  <img src="https://dollarshaveclub.github.io/postmate/assets/logo.svg">
</a>
> A powerful, simple, promise-based `postMessage` library.

* [Installing](#installing)
* [Glossary](#glossary)
* [Usage](#usage)
* [API](#api)
* [Licensing](#licensing)

## Installing
```sh
$ npm i postmate # Install via NPM
$ bower i postmate # Install via Bower
```

## Glossary
* **`Client`**: The **parent** page that will embed an `iFrame`
* **`Host`**: The **child** page that will expose information to the `Client`
* **`Consumer`**: The API that the `Client` or `Host` exposes

## Usage
The `Client` begins communication with the `Host`. A handshake is sent, the `Host` responds with
a handshake reply, finishing `Client` initialization. The two are bound and ready to mingle.

***

**parent.com**
```javascript
// Kick off the handshake with the iFrame
const pm = new Postmate.Handshake({
  container: document.getElementById('some-div'), // Element to inject frame into
  url: 'http://child.com/index.html' // Page to load, must have postmate.js. This will also be the origin used for communication.
});

// When client <-> host handshake is complete, data may be requested from the host
pm.then(host => {

  // Fetch the height property in child.html and set it to the iFrames height
  host.get('height')
    .then(height => host.frame.style.height = `${height}px`);
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
Client: Loading frame
Client: Sending handshake
Host: Received handshake from Client
Host: Sending handshake reply to Client
Registering consumer: host
Host awaiting messages...
Host Page Ready
Client: Received handshake reply from Host
Registering consumer: client
Client awaiting messages...
Client Page Ready
```

## API


## Licensing
