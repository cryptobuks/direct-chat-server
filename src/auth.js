const crypto = require('crypto');
const paths = require('./paths');
const fs = require('fs');

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
    return crypto
      .privateDecrypt(
        { key: this.privateKey, passphrase: this.passphrase, },
        Buffer.from(textBase64, 'base64')
      )
      .toString('utf8');
  }
}

module.exports = new Auth();
