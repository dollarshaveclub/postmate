/* eslint-env browser */

/**
 * A flag indicating MessageChannel support
 * @type {Boolean}
 */
const supportsMessageChannel = typeof MessageChannel !== 'undefined'

/**
 * The type of messages our frames our sending
 * @type {String}
 */
export const messageType = 'application/x-postmate-v1+json'

/**
 * The maximum number of attempts to send a handshake request to the parent
 * @type {Number}
 */
export const maxHandshakeRequests = 5

/**
 * A unique message ID that is used to ensure responses are sent to the correct requests
 * @type {Number}
 */
let _messageId = 0

/**
 * Increments and returns a message ID
 * @return {Number} A unique ID for a message
 */
export const generateNewMessageId = () => ++_messageId

/**
 * Postmate logging function that enables/disables via config
 * @param  {Object} ...args Rest Arguments
 */
export const log = (...args) => Postmate.debug ? console.log(...args) : null // eslint-disable-line no-console

/**
 * Takes a URL and returns the origin
 * @param  {String} url The full URL being requested
 * @return {String}     The URLs origin
 */
export const resolveOrigin = (url) => {
  const a = document.createElement('a')
  a.href = url
  const protocol = a.protocol.length > 4 ? a.protocol : window.location.protocol
  const host = a.host.length ? ((a.port === '80' || a.port === '443') ? a.hostname : a.host) : window.location.host
  return a.origin || `${protocol}//${host}`
}

const messageTypes = {
  handshake: 1,
  'handshake-reply': 1,
  call: 1,
  emit: 1,
  reply: 1,
  request: 1,
}

/**
 * Ensures that a message is safe to interpret
 * @param  {Object}          message       The postmate message being sent
 * @param  {String|Boolean}  allowedOrigin The whitelisted origin
 *                                         or false to skip origin check
 * @return {Boolean}
 */
export const sanitize = (message, allowedOrigin) => {
  if (!supportsMessageChannel &&
    typeof allowedOrigin === 'string' &&
    message.origin !== allowedOrigin
  ) return false
  if (typeof message.data !== 'object') return false
  if (!('postmate' in message.data)) return false
  if (message.data.type !== messageType) return false
  if (!messageTypes[message.data.postmate]) return false
  return true
}

/**
 * Helper function calling postMessage appropriately based on the target object support
 * @param  {Object} target    Target object - window/port
 * @param  {Object} message   Message to be sent
 * @param  {String} origin    Target's origin
 */
const postMessage = (target, message, origin) => {
  let isNotDefined
  target.postMessage(message, supportsMessageChannel ? isNotDefined : origin)
}

/**
 * Takes a model, and searches for a value by the property
 * @param  {Object} model     The dictionary to search against
 * @param  {String} property  A path within a dictionary (i.e. 'window.location.href')
 * @param  {Object} data      Additional information from the get request that is
 *                            passed to functions in the child model
 * @return {Promise}
 */
export const resolveValue = (model, property) => {
  const unwrappedContext = typeof model[property] === 'function'
    ? model[property]() : model[property]
  return Postmate.Promise.resolve(unwrappedContext)
}

/**
 * Composes an API to be used by the parent
 * @param {Object} info Information on the consumer
 */
export class ParentAPI {
  constructor (info) {
    this.parent = info.parent
    this.frame = info.frame
    this.child = info.child
    this.childOrigin = info.childOrigin
    this.source = info.source

    this.events = {}

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Registering API')
    }

    this.listener = (e) => {
      if (!sanitize(e, this.childOrigin)) return

      if (e.data.postmate === 'emit') {
        const { data, name } = e.data.value
        if (process.env.NODE_ENV !== 'production') {
          log(`Parent: Received event emission: ${name}`)
        }
        if (name in this.events) {
          this.events[name].call(this, data)
        }
      }
    }

    this.addMessageListener(this.listener)

    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Awaiting event emissions from Child')
    }
  }

  addMessageListener (listener) {
    this.source.addEventListener('message', listener, false)
  }

  removeMessageListener (listener) {
    this.source.removeEventListener('message', listener, false)
  }

  get (property) {
    return new Postmate.Promise((resolve) => {
      // Extract data from response and kill listeners
      const uid = generateNewMessageId()
      const transact = (e) => {
        if (!sanitize(e, this.childOrigin)) return

        if (e.data.uid === uid && e.data.postmate === 'reply') {
          this.removeMessageListener(transact)
          resolve(e.data.value)
        }
      }

      // Prepare for response from Child...
      this.addMessageListener(transact)

      // Then ask child for information
      postMessage(this.source, {
        postmate: 'request',
        type: messageType,
        property,
        uid,
      }, this.childOrigin)
    })
  }

  call (property, data) {
    // Send information to the child
    postMessage(this.source, {
      postmate: 'call',
      type: messageType,
      property,
      data,
    }, this.childOrigin)
  }

  on (eventName, callback) {
    this.events[eventName] = callback
  }

  destroy () {
    if (process.env.NODE_ENV !== 'production') {
      log('Parent: Destroying Postmate instance')
    }
    this.removeMessageListener(this.listener)
    this.frame.parentNode.removeChild(this.frame)
  }
}

/**
 * Composes an API to be used by the child
 * @param {Object} info Information on the consumer
 */
export class ChildAPI {
  constructor (info) {
    this.model = info.model
    this.parent = info.parent
    this.parentOrigin = info.parentOrigin
    this.child = info.child
    this.source = info.source

    if (process.env.NODE_ENV !== 'production') {
      log('Child: Registering API')
      log('Child: Awaiting messages...')
    }

    this.source.addEventListener('message', (e) => {
      if (!sanitize(e, this.parentOrigin)) return

      if (process.env.NODE_ENV !== 'production') {
        log('Child: Received request', e.data)
      }

      const { property, uid, data } = e.data

      if (e.data.postmate === 'call') {
        if (property in this.model && typeof this.model[property] === 'function') {
          this.model[property].call(this, data)
        }
        return
      }

      // Reply to Parent
      resolveValue(this.model, property)
        .then(value => postMessage(this.source, {
          property,
          postmate: 'reply',
          type: messageType,
          uid,
          value,
        }, this.parentOrigin))
    })
  }

  emit (name, data) {
    if (process.env.NODE_ENV !== 'production') {
      log(`Child: Emitting Event "${name}"`, data)
    }
    postMessage(this.source, {
      postmate: 'emit',
      type: messageType,
      value: {
        name,
        data,
      },
    }, this.parentOrigin)
  }
}

/**
  * The entry point of the Parent.
 * @type {Class}
 */
class Postmate {
  // Internet Explorer craps itself
  static Promise = (() => {
    try {
      return window ? window.Promise : Promise
    } catch (e) {
      return log('Promise: error', e)
    }
  })()

  /**
   * Sets options related to the Parent
   * @param {Object} userOptions The element to inject the frame into, and the url
   * @return {Promise}
   */
  constructor ({
    container = typeof container !== 'undefined' ? container : document.body, // eslint-disable-line no-use-before-define
    model,
    url,
    classList = []
  } = userOptions) { // eslint-disable-line no-undef
    this.parent = window
    this.frame = document.createElement('iframe')
    this.frame.classList.add.apply(this.frame.classList, classList)
    container.appendChild(this.frame)
    this.child = this.frame.contentWindow || this.frame.contentDocument.parentWindow
    this.model = model || {}

    return this.sendHandshake(url)
  }

  /**
   * Begins the handshake strategy
   * @param  {String} url The URL to send a handshake request to
   * @return {Promise}     Promise that resolves when the handshake is complete
   */
  sendHandshake (url) {
    const childOrigin = resolveOrigin(url)
    let attempt = 0
    let responseInterval
    let removeReplyHandler
    return new Postmate.Promise((resolve, reject) => {
      if (supportsMessageChannel) {
        if (process.env.NODE_ENV !== 'production') {
          log(`Parent: Supports MessageChannel`)
        }
      }

      const replyFrom = (source) => {
        const reply = (e) => {
          if (!sanitize(e, childOrigin)) return

          this.source = source
          if (e.data.postmate === 'handshake-reply') {
            clearInterval(responseInterval)
            if (process.env.NODE_ENV !== 'production') {
              log('Parent: Received handshake reply from Child')
            }

            removeHandler()

            this.childOrigin = e.origin
            if (process.env.NODE_ENV !== 'production') {
              log('Parent: Saving Child origin', this.childOrigin)
            }
            return resolve(new ParentAPI(this))
          }

          // Might need to remove since parent might be receiving different messages
          // from different hosts
          if (process.env.NODE_ENV !== 'production') {
            log('Parent: Invalid handshake reply')
          }
          return reject('Failed handshake')
        }

        source.addEventListener('message', reply, false)
        const removeHandler = () => {
          source.removeEventListener('message', reply, false)
        }
        return removeHandler
      }

      const doSend = () => {
        if (attempt === maxHandshakeRequests) {
          clearInterval(responseInterval)
          return
        }
        attempt++
        if (removeReplyHandler) {
          removeReplyHandler()
        }
        if (process.env.NODE_ENV !== 'production') {
          log(`Parent: Sending handshake attempt ${attempt}`, { childOrigin })
        }

        let port1, port2
        if (supportsMessageChannel) {
          ({ port1, port2 } = new MessageChannel())
          removeReplyHandler = replyFrom(port1)
          port1.start()
        } else {
          removeReplyHandler = replyFrom(this.parent)
        }

        this.child.postMessage(
          {
            postmate: 'handshake',
            type: messageType,
            model: this.model,
          },
          childOrigin,
          port2 ? [port2] : [],
        )
      }

      const loaded = () => {
        doSend()
        responseInterval = setInterval(doSend, 500)
      }

      if (this.frame.attachEvent) {
        this.frame.attachEvent('onload', loaded)
      } else {
        this.frame.onload = loaded
      }

      if (process.env.NODE_ENV !== 'production') {
        log('Parent: Loading frame', { url })
      }
      this.frame.src = url
    })
  }
}

/**
 * The entry point of the Child
 * @type {Class}
 */
Postmate.Model = class Model {
  /**
   * Initializes the child, model, parent, and responds to the Parents handshake
   * @param {Object} model Hash of values, functions, or promises
   * @return {Promise}       The Promise that resolves when the handshake has been received
   */
  constructor (model) {
    this.child = window
    this.model = model
    this.parent = this.child.parent
    return this.sendHandshakeReply()
  }

  /**
   * Responds to a handshake initiated by the Parent
   * @return {Promise} Resolves an object that exposes an API for the Child
   * ---
   * ⚠️ ports if/else (within this method)
   * - insures that ports is defined
   * - so that *when* a [port] *is* available
   * - a postMessage(reply) will be sent
   */
  sendHandshakeReply () {
    return new Postmate.Promise((resolve, reject) => {
      const shake = (e) => {
        if (!sanitize(e, false)) return

        if (e.data.postmate === 'handshake') {
          if (process.env.NODE_ENV !== 'production') {
            log('Child: Received handshake from Parent')
          }
          this.child.removeEventListener('message', shake, false)
          if (process.env.NODE_ENV !== 'production') {
            log('Child: Sending handshake reply to Parent')
          }

          const {source, ports, origin} = e

          const reply = {
            postmate: 'handshake-reply',
            type: messageType,
          }

          if (ports) {
            const port = ports[0]
            port.postMessage(reply)
            this.source = port
            port.start()
          } else {
            source.postMessage(reply, origin)
            this.source = source
          }

          this.parentOrigin = origin

          // Extend model with the one provided by the parent
          const defaults = e.data.model
          if (defaults) {
            Object.keys(defaults).forEach(key => {
              this.model[key] = defaults[key]
            })
            if (process.env.NODE_ENV !== 'production') {
              log('Child: Inherited and extended model from Parent')
            }
          }

          if (process.env.NODE_ENV !== 'production') {
            log('Child: Saving Parent origin', this.parentOrigin)
          }
          return resolve(new ChildAPI(this))
        }
        return reject('Handshake Reply Failed')
      }
      this.child.addEventListener('message', shake, false)
    })
  }
}

export { Postmate }
