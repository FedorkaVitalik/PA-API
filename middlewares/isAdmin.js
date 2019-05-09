/* eslint-disable func-names */
/* eslint-disable consistent-return */
const errorMessages = require('../constants/errorMessages');

const CustomError = require('../utils/CustomError');

module.exports.isAdmin = function (req, res, next) {
  const { accessRole } = req;

  if (accessRole !== 1) {
    return next(new CustomError(errorMessages.ACCESS_CLOSED, 403));
  }
  next();
};
