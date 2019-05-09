/* eslint-disable func-names */
const accessRoles = require('../constants/accessRole');
const securityHelper = require('./securityHelper.js');
const adminCreds = require('../constants/adminCreds');

module.exports = async function (Model) {
  try {
    const user = await Model.findOne({ accessRole: accessRoles.Administrator });

    if (!user) {
      const password = await securityHelper.createHash(adminCreds.password);

      await Model.create({
        ...adminCreds,
        password
      });
    }
  } catch (error) {
    throw error;
  }
};
