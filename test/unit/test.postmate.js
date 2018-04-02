import {
  ChildAPI,
  log,
  maxHandshakeRequests,
  messageId,
  messageType,
  ParentAPI,
  Postmate,
  resolveOrigin,
  resolveValue,
  sanitize,
} from '../../src/postmate'

// Jest works
test('Jest is working', () => expect(1).toBe(1))

test('Message Type', () => expect(messageType).toBe('application/x-postmate-v1+json'))

test('messageId', () => expect(!isNaN(messageId())).toBe(true))

// test API
// the tests below test the API generally
test('Postmate class is ready to rock', () => {
  expect(typeof Postmate !== 'undefined')
  expect(typeof Postmate).toBe('function')
  expect(typeof Postmate.Model !== 'undefined')
  expect(typeof Postmate.Model).toBe('function')
  expect(typeof Postmate.Promise !== 'undefined')
  expect(typeof Postmate.Promise).toBe('function')
})

test('ChildAPI class is ready to rock', () => {
  expect(typeof ChildAPI !== 'undefined')
  expect(typeof ChildAPI).toBe('function')
  expect(typeof ChildAPI.emit !== 'undefined')
})

test('log func is ready to rock', () => {
  expect(typeof log !== 'undefined')
  expect(typeof log).toBe('function')
})

test('maxHandshakeRequests class is ready to rock', () => {
  expect(maxHandshakeRequests === 5)
})

test('messageId class is ready to rock', () => {
  expect(typeof messageId !== 'undefined')
})

test('message_type class is ready to rock', () => {
  expect(typeof message_type !== 'undefined')
})

test('ParentAPI class is ready to rock', () => {
  expect(typeof ParentAPI !== 'undefined')
  expect(typeof ParentAPI).toBe('function')
})

test('resolveOrigin class is ready to rock', () => {
  expect(typeof resolveOrigin !== 'undefined')
})

test('resolveValue class is ready to rock', () => {
  expect(typeof resolveValue !== 'undefined')
})

test('sanitize class is ready to rock', () => {
  expect(typeof sanitize !== 'undefined')
})

// test mocks
// the tests below test the interworkings of Postmate methods
test('Postmate mocking', () => {
  Postmate.debug = true
  const test = new Postmate({
    container: document.body,
    url: 'http://child.com/',
    model: { foo: 'bar' },
  })
  expect(test.debug === true)
  expect(typeof test).toBe('object')
})

test('ChildAPI mocking', () => {
  Postmate.debug = true
  const info = {
    model: { foo: 'bar' },
    parent: document.body,
    parentOrigin: 'https://parent.com',
    child: document.body,
  }
  const childMock = new ChildAPI(info)
  expect(typeof childMock).toBe('object')
})

test('ParentAPI mocking', () => {
  Postmate.debug = true
  const info = {
    model: { foo: 'bar' },
    parent: document.body,
    parentOrigin: 'https://parent.com',
    child: document.body,
  }
  const parentMock = new ParentAPI(info)
  expect(typeof parentMock).toBe('object')
})


