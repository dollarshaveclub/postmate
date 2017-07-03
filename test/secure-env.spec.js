require('../src/secure-env');
const expect = require('chai').expect;
const noop = () => {};

describe('secure-env', function() {

  if (window.crypto) {
    it('should protect crypto', function () {
      window.crypto = noop;
      expect(window.crypto).to.be.a('Crypto');
      expect(window.crypto).to.not.equal(noop);
    });

    it('should protect crypto.getRandomValues', function () {
      window.crypto.getRandomValues = noop;
      expect(window.crypto.getRandomValues).to.be.a('function');
      expect(window.crypto.getRandomValues).to.not.equal(noop);
    });
  }

  if (window.msCrypto) {
    it('should protect msCrypto', function () {
      window.msCrypto = noop;
      expect(window.msCrypto).to.be.a('Crypto');
      expect(window.msCrypto).to.not.equal(noop);
    });

    it('should protect msCrypto.getRandomValues', function () {
      window.msCrypto.getRandomValues = noop;
      expect(window.msCrypto.getRandomValues).to.be.a('function');
      expect(window.msCrypto.getRandomValues).to.not.equal(noop);
    });
  }

  it('should protect Math', function () {
    window.Math = noop;
    expect(window.Math).to.be.a('Math');
    expect(window.Math).to.not.equal(noop);
  });

  ['random', 'max', 'min', 'pow', 'floor', 'ceil'].forEach(function (prop) {
    it('should protect Math.' + prop, function () {
      window.Math[prop] = noop;
      expect(window.Math[prop]).to.be.a('function');
      expect(window.Math[prop]).to.not.equal(noop);
    });
  });

});
