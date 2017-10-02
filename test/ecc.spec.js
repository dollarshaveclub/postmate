const ecc = require('../src/ecc');
const expect = require('chai').expect;

describe('ecc', function() {

  it ('should generate keys', function () {
    const keys = ecc.generate();

    expect(keys.enc).to.have.length(99);
    expect(keys.dec).to.have.length(51);
  });

  it ('should encrypt', function () {
    const keys = ecc.generate();
    const string = '1 test string на разных языках 😃';
    const encrypted = ecc.encrypt(keys.enc, string);
    const decrypted = ecc.decrypt(keys.dec, encrypted);

    expect(encrypted).to.be.an('object');
    expect(decrypted).to.equal(string);
  });

});