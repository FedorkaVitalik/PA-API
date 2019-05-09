/* eslint-disable func-names */
const User = require('../models/User');
const accessRoles = require('../constants/accessRole');
const securityHelper = require('./securityHelper.js');
const adminCreds = require('../constants/adminCreds');

module.exports = async function () {
  try {
    const user = await User.findOne({ accessRole: accessRoles.Administrator });

    if (!user) {
      const password = await securityHelper.createHash(adminCreds.password);

      await User.create({
        ...adminCreds,
        password
      });
    }
  } catch (error) {
    throw error;
  }
};
