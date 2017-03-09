const expect = chai.expect;

describe('postmate', () => {
  it('should pass', () => {
    expect(1).to.equal(1);
  });

  it('should complete a handshake', (done) => {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then((child) => {
      child.destroy();
      done();
    });
  });

  it('should fetch values from the child model', (done) => {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then((child) => {
      child.get('height').then((height) => {
        expect(height).to.equal(1234);
        child.destroy();
        done();
      })
      .catch((err) => { done(err); });
    });
  });

  it('should call a function in the child model', (done) => {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then((child) => {
      const uid = Math.random();
      child.call('setRandomId', uid);
      child.get('getRandomId').then((randomId) => {
        expect(randomId).to.equal(uid);
        child.destroy();
        done();
      })
      .catch((err) => { done(err); });
    });
  });

  it('should call a function in the child model and return its value', () => new Postmate({
    container: document.getElementById('frame'),
    url: 'http://localhost:9000/child.html',
  }).then((child) => {
    const uid = Math.random();
    return child.call('identity', uid).then((value) => {
      expect(value).to.equal(uid);
    });
  }));

  it('should fetch values from the child model from defaults set by the parent', (done) => {
    const uid = new Date().getTime();

    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      model: {
        uid,
      },
    }).then((child) => {
      child.get('uid').then((response) => {
        expect(response).to.equal(uid);
        child.destroy();
        done();
      })
      .catch((err) => { done(err); });
    });
  });

  it('should listen and receive events from the child', (done) => {
    const uid = new Date().getTime();

    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      model: {
        uid,
      },
    }).then((child) => {
      child.on('validated', (response) => {
        expect(response).to.equal(uid);
        child.destroy();
        done();
      });

      // This is abnormal, but we are going to trigger the event
      // 1 second after this function is called
      child.get('doValidate').catch((err) => { done(err); });
    });
  });

  it('should resolve multiple promises', (done) => {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then((child) => {
      RSVP.hash({
        a: child.get('a'),
        b: child.get('b'),
      }).then((data) => {
        expect(data.a).to.equal('a');
        expect(data.b).to.equal('b');
        done();
      }).catch((err) => { done(err); });
    });
  });
});
