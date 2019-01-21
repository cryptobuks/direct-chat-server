const path = require('path');
const root = path.resolve(__dirname, '..');

const paths = {
  publicKey: path.resolve(root, 'ssh', 'public'),
  privateKey: path.resolve(root, 'ssh', 'private'),
  storage: path.resolve(root, 'src', 'db', 'dc.sqlite'),
};

module.exports = paths;
