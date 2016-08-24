var expect = chai.expect;

describe('postmate', function() {

  afterEach(function () {
    document.getElementById('frame').innerHTML = "";
  });

  it('should pass', function() {
    expect(1).to.equal(1);
  });

  it('should complete a handshake', function (done) {
    new Postmate.Handshake({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html'
    }).then(function (child) {
      done();
    });
  });

  it('should fetch properties from the child', function (done) {
    new Postmate.Handshake({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html'
    }).then(function (child) {
      child.get('height').then(function (height) {
        expect(height).to.equal(1234);
        done();
      })
      .catch(err => done(err));
    });
  });

  it('should fetch properties with additional data from the child', function (done) {

    var uid = new Date().getTime();

    new Postmate.Handshake({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html'
    }).then(function (child) {
      child.get('dynamicResponse', { uid: uid }).then(function (response) {
        expect(response).to.equal(++uid);
        done();
      })
      .catch(err => done(err));
    });
  });
});
