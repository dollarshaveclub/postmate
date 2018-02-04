import { 
  ChildAPI,
  hasOwnProperty,
  log,
  maxHandshakeRequests,
  messageId,
  message_type,
  ParentAPI,
  Postmate,
  resolveOrigin,
  resolveValue,
  sanitize,
} from '../../src/postmate'

// Jest works
test('Jest is working', () => expect(1).toBe(1))

// test API
// the tests below test the API generally
test('Postmate class is ready to rock', () => {
  expect(typeof Postmate !== 'undefined')
  expect(typeof Postmate).toBe('function')
  expect(typeof Postmate.Model !== 'undefined')
  expect(typeof Postmate.Model).toBe('function')
  expect(typeof Postmate.Promise !== 'undefined')
  expect(typeof Postmate.Promise).toBe('function')
  expect(typeof Postmate.debug === false)
})

test('ChildAPI class is ready to rock', () => {
  expect(typeof ChildAPI !== 'undefined')
  expect(typeof ChildAPI).toBe('function')
  expect(typeof ChildAPI.emit !== 'undefined')
})

test('log func is ready to rock', () => {
  expect(typeof log !== 'undefined')
  expect(typeof ChildAPI).toBe('function')
})


// test mocks
// the tests below test the interworkings of Postmate methods
test('Postmate mocking', () => {
  Postmate.debug = true
  const test = new Postmate({
    container: document.body,
    url: 'http://child.com/',
    model: { foo: 'bar' }
  })
  expect(typeof test.debug === true)
  expect(typeof test).toBe('object')
})
