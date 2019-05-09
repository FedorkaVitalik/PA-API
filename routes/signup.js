/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');

const User = require('../models/User');
const securityHelper = require('../utils/securityHelper');

const router = express.Router();

module.exports = function () {
  router.post('/signup', async (req, res) => {
    const { password } = req.body;

    const passwordHash = await securityHelper.createHash(password);

    const user = { ...req.body };
    user.password = passwordHash;

    const newUser = await User.create(user);

    const token = await securityHelper.createToken(newUser._id);
    const refreshToken = await securityHelper.refreshToken(newUser._id);

    await User.findByIdAndUpdate(
      { _id: newUser._id },
      { token, refreshToken },
      { new: true }
    );

    newUser.pass = undefined;
    res.status(201).json({ newUser, token, refreshToken });
  });
  return router;
};
