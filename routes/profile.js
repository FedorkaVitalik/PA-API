/* eslint-disable no-console */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const ObjectId = require('mongodb').ObjectID;

const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const errorMessages = require('../constants/errorMessages');
const isAuthorized = require('../middlewares/isAuthorized');

module.exports = function () {
  const router = express.Router();

  router.use(isAuthorized.isAuthorized());

  router.put('/profile/:id', async (req, res) => {
    const { id } = req.params;
    const _id = ObjectId(id);

    const user = await User.findById({ _id });

    if (!user) {
      throw new CustomError(errorMessages.NOT_FOUND('user'), 404);
    }

    const { password } = req.body;

    if (password) {
      throw new CustomError();
    }

    await User.findByIdAndUpdate({ _id }, req.body, { new: true });

    const updUser = await User.findById({ _id });

    updUser.pass = undefined;
    res.status(200).json(updUser);
  });

  return router;
};
