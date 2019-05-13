/* eslint-disable no-console */
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

    const justCtreatedPost = await Post.create({
      title,
      body,
      createdBy: user._id,
      date,
      countOfLikes: []
    });

    const newPost = await Post.findById({
      _id: justCtreatedPost._id
    }).populate('createdBy', 'fname lname');

    if (user.followers) {
      for (const followerId of user.followers) {
        const follower = await User.findOne({ _id: followerId });
        await sendMail.sendOne(
          follower.email,
          subjects.NEW_POST,
          messages.NEW_POST
        );

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

    res.status(201).json(newPost);
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

  router.patch('/posts/likePost/:id', async (req, res) => {
    const { id } = req.params;

    const user = await User.findById({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }
    const postId = ObjectId(id);

    await Post.findByIdAndUpdate(
      {
        _id: postId
      },
      {
        $addToSet: {
          countOfLikes: user._id
        }
      }
    );
    res.status(200).json('Liked');
  });

  router.patch('/posts/unlikePost/:id', async (req, res) => {
    const { id } = req.params;

    const user = await User.findById({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }
    const postId = ObjectId(id);

    await Post.findByIdAndUpdate(
      {
        _id: postId
      },
      {
        $pull: {
          countOfLikes: user._id
        }
      },
      { safe: true, upsert: true }
    );
    res.status(200).json('Unliked');
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

  router.get('/myPosts', async (req, res) => {
    const filter = req.accessRole.includes(1) ? {} : { createdBy: req.userId };

    await Post.find(filter)
      .populate('createdBy', 'fname lname')
      .exec((err, posts) => {
        if (err) {
          // eslint-disable-next-line indent
          console.error(err);
        }
        res.status(200).json(posts);
      });
  });

  router.get('/posts', async (req, res) => {
    const user = await User.findById({ _id: req.userId });

    const { following } = user;

    await Post.find({ createdBy: { $in: [...following, req.userId] } })
      .populate('createdBy', 'fname lname')
      .exec((err, posts) => {
        if (err) {
          // eslint-disable-next-line indent
          console.error(err);
        }
        res.status(200).json(posts);
      });
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
