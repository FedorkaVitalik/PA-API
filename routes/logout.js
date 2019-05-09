/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const ObjectId = require('mongodb').ObjectID;

const User = require('../models/User');

const router = express.Router();

module.exports = function () {
  router.delete('/logout/:id', async (req, res) => {
    const { id } = req.params;
    const _id = ObjectId(id);

    await User.findByIdAndUpdate(
      { _id },
      {
        $unset: { token: 1, refreshToken: 1 }
      },
      { new: true }
    );

    res.status(200).json('success');
  });

  return router;
};
