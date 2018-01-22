import Postmate from '../../src/postmate'

// Jest works
test('Jest is working', () => expect(1).toBe(1))
// Post
test('Postmate class is ready to rock', () => {
  expect(typeof Postmate !== 'undefined')
  expect(typeof Postmate).toBe('function')
})
