require('imports-loader?sjcl=sjcl!sjcl/core/bn');
require('imports-loader?sjcl=sjcl!sjcl/core/ecc');
require('imports-loader?sjcl=sjcl!sjcl/core/convenience');

const sjcl = require('sjcl');

const cache = {
  enc: {}, dec: {}
};

function extract(str) {
  return {
    curve: sjcl.ecc.curves['c' + str.substr(0, 3)],
    hex: str.substr(3)
  };
}

function exportPublic(keyObj) {
  let obj = keyObj.get();

  return keyObj.$curve +
    sjcl.codec.hex.fromBits(obj.x) +
    sjcl.codec.hex.fromBits(obj.y);
}

function exportSecret(keyObj) {
  return keyObj.$curve + sjcl.codec.hex.fromBits(keyObj.get());
}

const elg = {
  generate(curve) {
    const keys = sjcl.ecc.elGamal.generateKeys(curve, 1);

    keys.pub.$curve = curve;
    keys.sec.$curve = curve;
    return keys;
  },
  importPublic(keyStr) {
    const key = extract(keyStr);

    return new sjcl.ecc.elGamal.publicKey(key.curve, sjcl.codec.hex.toBits(key.hex)); // eslint-disable-line
  },
  importSecret(keyStr) {
    const key = extract(keyStr);

    return new sjcl.ecc.elGamal.secretKey(key.curve, new sjcl.bn(key.hex)); // eslint-disable-line
  }
};

module.exports = {
  sjcl: sjcl,

  generate() {
    const keys = elg.generate(192);

    return {
      enc: exportPublic(keys.pub),
      dec: exportSecret(keys.sec)
    };
  },

  encrypt(enckey, plaintext) {
    let kem = cache.enc[enckey];

    if (!kem) {
      kem = cache.enc[enckey] = elg.importPublic(enckey).kem();
      kem.tagHex = sjcl.codec.hex.fromBits(kem.tag);
    }

    let obj = sjcl.json._encrypt(kem.key, plaintext);

    obj.tag = kem.tagHex;

    return JSON.stringify(obj);
  },

  decrypt(deckey, ciphertext) {
    let obj = JSON.parse(ciphertext);
    let kem = cache.dec[deckey];

    if (!kem) {
      kem = cache.dec[deckey] = elg.importSecret(deckey);
      kem.$keys = {};
    }

    let key = kem.$keys[obj.tag];

    if (!key) {
      key = kem.$keys[obj.tag] = kem.unkem(sjcl.codec.hex.toBits(obj.tag));
    }

    return sjcl.json._decrypt(key, obj);
  }
};
