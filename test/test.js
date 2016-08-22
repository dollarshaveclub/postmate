var expect = chai.expect;

describe('postmate', function() {

  it('should pass', function() {
    expect(1).to.equal(1);
  });

  it('should fetch the childs height', function (done) {
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
});
