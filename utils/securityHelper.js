/* eslint-disable no-console */
/* eslint-disable func-names */
const jwt = require('jsonwebtoken');

const bcrypt = require('bcrypt');
const config = require('../config.js');

const saltRounds = 10;

// eslint-disable-next-line consistent-return
module.exports.createHash = async function (password) {
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    return hash;
  } catch (error) {
    console.log(error);
  }
};

module.exports.createToken = function (id) {
  return jwt.sign({ id }, config.secretToken, {
    expiresIn: 60 * 60 // 1 hour
  });
};

module.exports.refreshToken = function (id) {
  return jwt.sign({ id }, config.secretRefreshToken, {
    expiresIn: 60 * 60 * 24 // 24 hours
  });
};

module.exports.checkPassword = function (password, hash) {
  return bcrypt.compare(password, hash);
};
