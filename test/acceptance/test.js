var expect = chai.expect

describe('postmate', function () {
  it('should pass', function () {
    expect(1).to.equal(1)
  })

  it('should complete a handshake', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then(function (child) {
      child.destroy()
      done()
    })
  })

  it('should have a name', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      name: 'postmate',
    }).then(function (child) {
      expect(document.querySelector('iframe').name).to.equal('postmate')
      child.destroy()
      done()
    })
  })

  it('should have classes', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      classListArray: ['classOne', 'classTwo'],
    }).then(function (child) {
      expect(document.querySelector('iframe').classList).to.be.include({ 0: 'classOne', 1: 'classTwo' })
      child.destroy()
      done()
    })
  })

  it('should fetch values from the child model', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then(function (child) {
      child.get('height').then(function (height) {
        expect(height).to.equal(1234)
        child.destroy()
        done()
      })
        .catch(function (err) { done(err) })
    })
  })

  it('should call a function in the child model', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then(function (child) {
      var uid = Math.random()
      child.call('setRandomId', uid)
      child.get('getRandomId').then(function (randomId) {
        expect(randomId).to.equal(uid)
        child.destroy()
        done()
      })
        .catch(function (err) { done(err) })
    })
  })

  it('should call a function in the child model with the child model context', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then(function (child) {
      child.call('setFoo', 'bar')
      child.get('foo').then(function (foo) {
        expect(foo).to.equal('bar')
        child.destroy()
        done()
      })
        .catch(function (err) { done(err) })
    })
  })

  it('should fetch values from the child model from defaults set by the parent', function (done) {
    var uid = new Date().getTime()

    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      model: {
        uid: uid,
      },
    }).then(function (child) {
      child.get('uid').then(function (response) {
        expect(response).to.equal(uid)
        child.destroy()
        done()
      })
        .catch(function (err) { done(err) })
    })
  })

  it('should listen and receive events from the child', function (done) {
    var uid = new Date().getTime()

    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
      model: {
        uid: uid,
      },
    }).then(function (child) {
      child.on('validated', function (response) {
        expect(response).to.equal(uid)
        child.destroy()
        done()
      })

      // This is abnormal, but we are going to trigger the event 1 second after this function is called
      child.get('doValidate').catch(function (err) { done(err) })
    })
  })

  it('should listen and receive events from the child, but only from the set child', function (done) {
    var uid1 = new Date().getTime() - 47
    var uid2 = new Date().getTime() + 21961

    var build = function (uid) {
      return new Postmate({
        container: document.getElementById('frame'),
        url: 'http://localhost:9000/child.html',
        model: {
          uid: uid,
        },
      })
    }
    RSVP.hash({
      c1: build(uid1),
      c2: build(uid2),
    }).then(function (data) {
      var callCount = 0
      data.c1.on('validated', function (response) {
        expect(response).to.equal(uid1)
        callCount++
        if (callCount >= 2) {
          data.c1.destroy()
          done()
        }
      })

      data.c2.on('validated', function (response) {
        expect(response).to.equal(uid2)
        callCount++
        if (callCount >= 2) {
          data.c2.destroy()
          done()
        }
      })

      // This is abnormal, but we are going to trigger the event 1 second after this function is called
      data.c1.get('doValidate').catch(function (err) { done(err) })
      data.c2.get('doValidate').catch(function (err) { done(err) })
    }).catch(function (err) { done(err) })
  })

  it('should resolve multiple promises', function (done) {
    new Postmate({
      container: document.getElementById('frame'),
      url: 'http://localhost:9000/child.html',
    }).then(function (child) {
      RSVP.hash({
        a: child.get('a'),
        b: child.get('b'),
      }).then(function (data) {
        expect(data.a).to.equal('a')
        expect(data.b).to.equal('b')
        done()
      }).catch(function (err) { done(err) })
    })
  })
})
