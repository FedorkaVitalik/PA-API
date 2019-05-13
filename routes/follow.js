/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable func-names */
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const CustomError = require('../utils/CustomError');
const sendMail = require('../utils/sendMail');
const config = require('../config');
const errorMessages = require('../constants/errorMessages');
const messages = require('../constants/messages');
const subjects = require('../constants/subjects');

const middlewareAuth = require('../middlewares/isAuthorized');

module.exports = function () {
  const router = express.Router();

  router.use(middlewareAuth.isAuthorized());

  router.get('/users', async (req, res) => {
    const users = await User.find({});

    const usersData = [];
    for (const userObject of users) {
      if (!userObject._id.equals(req.userId)) {
        usersData.push({
          _id: userObject._id,
          fname: userObject.fname,
          lname: userObject.lname,
          followers: userObject.followers,
          following: userObject.following
        });
      }
    }

    res.status(200).json(usersData);
  });

  router.patch('/follow/:id', async (req, res) => {
    const { id } = req.params;

    const user = await User.findById({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }

    const bloggerId = ObjectId(id);

    await User.findByIdAndUpdate(
      {
        _id: req.userId
      },
      {
        $addToSet: {
          following: bloggerId
        }
      }
    );

    await User.findByIdAndUpdate(
      {
        _id: bloggerId
      },
      {
        $addToSet: {
          followers: req.userId
        }
      }
    );

    if (user.followers) {
      for (const followerId of user.followers) {
        const follower = await User.findByIdAndUpdate({ _id: followerId });
        await sendMail.sendOne(
          follower.email,
          subjects.FOLLOW,
          messages.FOLLOW(user.fname, follower.fname)
        );

        try {
          await jwt.verify(follower.token, config.secretToken);
        } catch (error) {
          await User.findByIdAndUpdate(
            { _id: followerId },
            {
              $addToSet: {
                news: {
                  follow: {
                    follower: req.userId,
                    follow: bloggerId
                  }
                }
              }
            }
          );
        }
      }
    }

    res.status(200).json('Success');
  });

  router.patch('/unFollow/:id', async (req, res) => {
    const { id } = req.params;

    const user = await User.findById({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }

    const bloggerId = ObjectId(id);

    await User.findByIdAndUpdate(
      {
        _id: req.userId
      },
      {
        $pull: {
          following: bloggerId
        }
      },
      { safe: true, upsert: true }
    );

    await User.findByIdAndUpdate(
      {
        _id: bloggerId
      },
      {
        $pull: {
          followers: req.userId
        }
      },
      { safe: true, upsert: true }
    );

    res.status(200).json('Success');
  });

  return router;
};
