const expect = require('chai').expect;
const Postmate = require('../src/postmate');
const childURL = '/base/test/fixtures/child.html';

describe('postmate', function() {
  this.timeout(5000);

  it('should complete a handshake', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: childURL
    }).then(function (child) {
      child.destroy();
      done();
    });
  });

  it('should fetch values from the child model', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: childURL
    }).then(function (child) {
      child.get('height').then(function (height) {
        expect(height).to.equal(1234);
        child.destroy();
        done();
      })
      .catch(function(err) { done(err); });
    });
  });

  it('should call a function in the child model', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: childURL
    }).then(function (child) {
      var uid = Math.random();
      child.call('setRandomId', uid);
      child.get('getRandomId').then(function (randomId) {
        expect(randomId).to.equal(uid);
        child.destroy();
        done();
      })
      .catch(function(err) { done(err); });
    });
  });

  it('should fetch values from the child model from defaults set by the parent', function (done) {

    var uid = new Date().getTime();

    new Postmate({
      container: document.getElementById('frame'),
      url: childURL,
      model: {
        uid: uid
      }
    }).then(function (child) {
      child.get('uid').then(function (response) {
        expect(response).to.equal(uid);
        child.destroy();
        done();
      })
      .catch(function(err) { done(err); });
    });
  });

  it('should listen and receive events from the child', function (done) {

    var uid = new Date().getTime();

    new Postmate({
      container: document.getElementById('frame'),
      url: childURL,
      model: {
        uid: uid
      }
    }).then(function (child) {

      child.on('validated', function (response) {
        expect(response).to.equal(uid);
        child.destroy();
        done();
      });

      // This is abnormal, but we are going to trigger the event 1 second after this function is called
      child.get('doValidate').catch(function(err) { done(err); });
    });
  });

  it('should resolve multiple promises', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: childURL
    }).then(function (child) {
      Promise.all([
        child.get('a'),
        child.get('b')
      ]).then(function (data) {
        expect(data[0]).to.equal('a');
        expect(data[1]).to.equal('b');
        child.destroy();
        done();
      }).catch(function(err) { done(err); });
    });
  });
});
