const ecc = require('eccjs');
const Postmate = require('./postmate');

const MESSAGE_TYPE = 'application/x-postmate-v2+json';

const getKeys = (self) => (
  self.keys = self.keys || {
    our: {},
    their: {}
  }
);

const encrypt = (self, data) => (
  ecc.encrypt(
    self.getKeys().their.enc,
    JSON.stringify(data)
  )
);

const decrypt = (self, data) => (
  ecc.decrypt(
    self.getKeys().our.dec,
    data.postmate
  )
);

class EncryptedPostmate extends Postmate {

  constructor(userOptions) {
    userOptions.messageType = userOptions.messageType || MESSAGE_TYPE;

    return super(userOptions);
  }

  getHandshakeRequest() {
    const request = Postmate.prototype.getHandshakeRequest.call(this);
    const keys = ecc.generate(ecc.ENC_DEC);

    this.getKeys().our = keys;
    request.key = keys.enc;

    return request;
  }

  getKeys() {
    return getKeys(this);
  }

  handleHandshakeData(data) {
    data = this.getIncomingMessage(data);
    this.getKeys().their.enc = data.key;
    return data;
  }

  getIncomingMessage(data) {
    const message = decrypt(this, data);

    return JSON.parse(message);
  }

  getOutcomingMessage(data) {
    if (!this.getKeys().their.enc) {
      return Postmate.prototype.getOutcomingMessage.call(this, data);
    }

    return {
      type: this.messageType,
      postmate: encrypt(this, data)
    };
  }
}

EncryptedPostmate.Model = class EncryptedModel extends Postmate.Model {

  constructor(model, messageType) {
    return super(model, messageType || MESSAGE_TYPE);
  }

  getKeys() {
    return getKeys(this);
  }

  handleHandshakeData(data) {
    this.getKeys().their.enc = data.key;
    return Postmate.Model.prototype.handleHandshakeData.call(this, data);
  }

  getHandshakeResponse() {
    const response = Postmate.Model.prototype.getHandshakeResponse.apply(this, arguments);
    const keys = ecc.generate(ecc.ENC_DEC);

    this.getKeys().our = keys;
    response.key = keys.enc;

    return response;
  }

  getIncomingMessage(data) {
    const message = decrypt(this, data);

    return JSON.parse(message);
  }

  getOutcomingMessage(data) {
    return {
      type: this.messageType,
      postmate: encrypt(this, data)
    };
  }
};

module.exports = EncryptedPostmate;
