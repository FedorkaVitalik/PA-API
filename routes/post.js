/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const Post = require('../models/Post');
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

  router.post('/posts', async (req, res) => {
    const { title, body } = req.body;

    const user = await User.findOne({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }

    const date = new Date(Date.now()).toString();

    await Post.create({
      title,
      body,
      createdBy: user._id,
      date,
      countOfLikes: []
    });

    if (user.followers) {
      for (const followerId of user.followers) {
        const follower = await User.findOne({ _id: followerId });
        await sendMail.sendOne(
          follower.email,
          subjects.NEW_POST,
          messages.NEW_POST
        );

        const newPost = await Post.findOne({ title });

        try {
          await jwt.verify(follower.token, config.secretToken);
        } catch (error) {
          await User.findByIdAndUpdate(
            { _id: followerId },
            {
              $addToSet: {
                news: { post: newPost._id }
              }
            }
          );
        }
      }
    }

    res.status(201).json({
      title,
      body,
      createdBy: user._id,
      date
    });
  });

  router.put('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const _id = ObjectId(id);

    const post = await Post.findById({ _id });

    if (!post) {
      throw new CustomError(errorMessages.NOT_FOUND('Post'), 404);
    }
    if (post.createdBy.equals(req.userId) || req.accessRole.includes(1)) {
      await Post.findByIdAndUpdate({ _id }, req.body, { new: true });
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }

    res.status(200).json('Success');
  });

  router.delete('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const _id = ObjectId(id);

    const post = await Post.findById({ _id });

    if (post.createdBy.equals(req.userId) || req.accessRole.includes(1)) {
      await Post.findByIdAndDelete({ _id });
      res.status(200).json('Deleted');
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }
  });

  router.get('/posts', async (req, res) => {
    const filter = req.accessRole.includes(1) ? {} : { createdBy: req.userId };

    const posts = await Post.find(filter);

    res.status(200).json(posts);
  });

  router.get('/posts/:id', async (req, res) => {
    const { id } = req.params;
    const _id = ObjectId(id);

    const post = await Post.findById({ _id });

    if (!post) {
      throw new CustomError(errorMessages.NOT_FOUND('Post'), 404);
    }

    if (post.createdBy.equals(req.userId) || req.accessRole.includes(1)) {
      res.status(200).json(post);
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }
  });

  return router;
};
