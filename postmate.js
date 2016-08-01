;(function () {

  const MESSAGE_TYPE = 'application/x-postmate-v1+json';

  function log() {
    // console.log.apply(console, arguments);
  }

  /**
   * Takes a context, and searches for a value located by the key
   * @param  {Object} context The dictionary to search against
   * @param  {String} key     A path within a dictionary (i.e. "window.location.href")
   * @return {Promise}
   */
  function resolveValue(context, key) {
    let unwrappedContext = typeof context[key] === "function" ? context[key]() : context[key];
    return Promise.resolve(unwrappedContext);
  }

  /**
   * Composes an API namespace for the respective client or host
   * @param {Object} data Information on the consumer
   */
  function Consumer(data) {
    let {id, context, client, frame, host} = data;
    this._messageID = 1;

    // var target = consumer === "client" ? host : client;
    log('Registering consumer', id);
    if (id === "client") {
      log('Client awaiting messages...');
      return {
        frame,
        get: function (key) {
          console.log("Getting", key);
          return new Promise(function (resolve, reject) {

            // Extract data from response and kill listeners
            let transact = e => {
              if (e.data.key === key) {
                client.removeEventListener('message', transact, false);
                resolve(e.data.value);
              }
            };

            // Await response from Host...
            client.addEventListener('message', transact, false);

            // Then ask host for information
            host.postMessage({
              key,
              type: MESSAGE_TYPE
            }, host.location.origin);
          })
        }
      };
    }
    else if (id === "host") {

      log('Host awaiting messages...');

      host.addEventListener('message', e => {
        if (e.origin !== client.location.origin) return;

        log("Host received message", e.data);
        let key = e.data.key;

        // Reply to Client
        resolveValue(context, e.data.key)
          .then(value => e.source.postMessage({
            key,
            value,
            type: MESSAGE_TYPE
          }, e.origin));
      });

      return {};
    }
  }

  // HOST
  function Postmate(context) {
    this.id = 'host';
    this.host = window;
    this.context = context;
    this.client = this.host.parent;

    log('Host: Sending handshake');

    let prom = new Promise((resolve, reject) => {
      log('Host: Adding handshake reply listener');

      let reply = e => {
        if( e.data.postmate === "handshake-reply") {
          log('Host: Received handshake reply from Client');
          log('Host: Removing handshake reply listener');
          this.host.removeEventListener('message', reply, false);
          return resolve(new Consumer(this));
        }
        return reject("Handshake Reply Failed");
      };
      this.host.addEventListener('message', reply, false);
    });

    this.client.postMessage({
      postmate: 'handshake',
      type: MESSAGE_TYPE
    }, "*");
    return prom;
  }

  /**
   * Establishes a 3-way handshake with the host (refactor for 2 way)
   *
   * The negotiation strategy is as follows:
   * 1. Synchronize: The client awaits for a message from the Host. When the Host loads, it sends the Client the handshake.
   * 2. Reply: The Client will receive the handshake and send back a reply.
   * 3. Acknowledgement: Once the Host receives the reply, it sends one final message to let the client know events have been established.
   *
   * @param {DocumentElement} container The element to inject the frame information
   * @param {String} url    The URL to load
   * @param {String} url    The default context from the Client to extend in the Host
   */
  Postmate.Handshake = function (container, url, context) {
    this.id = 'client';
    this.context = context;
    this.client = window;
    this.frame = document.createElement('iframe');
    container.appendChild(this.frame);
    this.host = this.frame.contentWindow;

    var prom = new Promise((resolve, reject) => {

      let shake = e => {
        if (e.data.postmate === "handshake") {
          log('Client: Received handshake from Host');
          log('Client: Removing handshake listener');
          this.client.removeEventListener('message', shake, false);
          log('Client: Sending handshake reply');
          e.source.postMessage({
            postmate: "handshake-reply",
            type: MESSAGE_TYPE
          }, e.origin);
          return resolve(new Consumer(this));
        } else {
          log('Client: Invalid handshake');
          return reject('Failed handshake');
        }
      }

      log('Client: Adding handshake listener');
      this.client.addEventListener('message', shake, false);
    });

    this.frame.src = url;
    return prom;
  };

  window.Postmate = Postmate;
})();
