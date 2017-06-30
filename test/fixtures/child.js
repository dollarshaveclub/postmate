const Postmate = require('../../src/postmate');

let parentAPI = null;
let randomId = null;

const height = function () { return document.height || document.body.offsetHeight; };
const foo = "foo";

const doValidate = function () {
  setTimeout(function () {
    parentAPI.emit('validated', parentAPI.model.uid);
  }, 200);
};
const a = function () { return 'a'; };
const b = function () {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve('b');
    }, 300);
  });
};
const setRandomId = function (data) { randomId = data; };
const getRandomId = function () { return randomId; };

new Postmate.Model({
  height: height,
  foo: foo,
  doValidate: doValidate,
  a: a,
  b: b,
  setRandomId: setRandomId,
  getRandomId: getRandomId
}).then(function (parent) { parentAPI = parent; });