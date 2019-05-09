/* eslint-disable no-useless-escape */
/* eslint max-len: ["error", { "ignoreRegExpLiterals": true }] */

module.exports = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
  ObjectId: /^[a-f\d]{24}$/
};
