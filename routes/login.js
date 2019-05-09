/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');

const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const errorMessages = require('../constants/errorMessages');
const securityHelper = require('../utils/securityHelper');
const validate = require('../utils/validate');

const router = express.Router();

module.exports = function () {
  router.put('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new CustomError(errorMessages.WRITE_PASSWORD_OR_EMAIL, 400);
    }
    if (!validate.EMAIL.test(email)) {
      throw new CustomError(errorMessages.NOT_VALID('email', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
      throw new CustomError(errorMessages.NOT_FOUND('user'), 404);
    }

    const passwordIsValid = await securityHelper.checkPassword(
      password,
      user.password
    );
    if (!passwordIsValid) {
      console.log(password, user.password);
      throw new CustomError(errorMessages.NOT_VALID('password'), 400);
    }
    const token = await securityHelper.createToken(user._id);
    const refreshToken = await securityHelper.refreshToken(user._id);

    const updUser = await User.findByIdAndUpdate(
      { _id: user._id },
      { $set: { token, refreshToken } },
      { new: true }
    );

    updUser.pass = undefined;
    res.status(200).json({
      updUser
    });
  });
  return router;
};
