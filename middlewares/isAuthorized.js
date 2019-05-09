/* eslint-disable func-names */
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const errorMessages = require('../constants/errorMessages');
const CustomError = require('../utils/CustomError');
const config = require('../config');

module.exports.isAuthorized = function () {
  return async function (req, res, next) {
    try {
      const token = req.headers['x-access-token'];
      if (!token) {
        throw new CustomError(errorMessages.USER_IS_NOT_AUTHORIZED, 403);
      }
      await jwt.verify(token, config.secretToken);

      const user = await User.findOne({ token });

      if (!user) {
        throw new CustomError(errorMessages.NOT_FOUND('user'), 404);
      }
      // eslint-disable-next-line no-underscore-dangle
      req.userId = user._id;
      req.accessRole = user.accessRole;

      next();
    } catch (error) {
      next(error);
    }
  };
};
