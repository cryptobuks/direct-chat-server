const crypto = require('crypto');
const paths = require('./paths');
const fs = require('fs');
const constants = require('constants');

class Auth {
  constructor() {
    this.passphrase = 'very strong pass phrase !?';
    this.publicKey = fs.readFileSync(paths.publicKey, 'utf8');
    this.privateKey = fs.readFileSync(paths.privateKey, 'utf8');
  }

  getPublicKey() {
    return this.publicKey;
  }

  encrypt(text) {
    return crypto
      .publicEncrypt(this.publicKey, Buffer.from(text, 'utf8'))
      .toString('base64');
  }

  decrypt(textBase64) {
    let text = undefined;
    try {
      text = crypto
        .privateDecrypt(
          { key: this.privateKey, },
          Buffer.from(textBase64, 'base64')
        )
        .toString('utf8');
      return text;
    } catch (err) {
      console.log(err.message);
    }
  }
}

module.exports = new Auth();
