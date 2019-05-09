/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-underscore-dangle */
/* eslint-disable func-names */
const express = require('express');
const jwt = require('jsonwebtoken');
const { ObjectId } = require('mongodb');

const User = require('../models/User');
const Comment = require('../models/Comment');
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

  router.post('/posts/:id/comments', async (req, res) => {
    const { text } = req.body;
    const { id } = req.params;

    if (!text) {
      throw new CustomError(errorMessages.WRITE_TEXT, 400);
    }

    const user = await User.findOne({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }
    const postId = ObjectId(id);

    const date = new Date(Date.now()).toString();

    await Comment.create({
      author: user._id,
      date,
      post: postId,
      text
    });

    if (user.followers) {
      for (const followerId of user.followers) {
        const follower = User.findOne({ _id: followerId });
        await sendMail.sendOne(
          follower.email,
          subjects.NEW_COMMENT,
          messages.NEW_COMMENT
        );

        const newComment = Comment.findOne({ text });

        try {
          await jwt.verify(follower.token, config.secretToken);
        } catch (error) {
          await User.findByIdAndUpdate(
            { _id: followerId },
            {
              $addToSet: {
                news: { comment: newComment._id }
              }
            }
          );
        }
      }
    }

    res.status(201).json({
      author: user._id,
      date,
      post: postId,
      text
    });
  });

  router.put('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;

    const user = await User.findOne({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }
    const _id = ObjectId(commentId);

    const date = new Date(Date.now()).toString();

    const comment = await Comment.findById({ _id });

    if (comment.author.equals(req.userId) || req.accessRole.includes(1)) {
      await Comment.findByIdAndUpdate(
        { _id },
        {
          date,
          text
        }
      );

      res.status(200).json('success');
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }
  });

  router.get('/myComments', async (req, res) => {
    const user = await User.findOne({ _id: req.userId });

    if (user.isBlocked === true) {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 400);
    }
    const comments = await Comment.find({ author: req.userId });

    res.status(200).json(comments);
  });

  router.get('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;

    const _id = ObjectId(commentId);

    const comment = await Comment.findById({ _id });

    if (!comment) {
      throw new CustomError(errorMessages.NOT_FOUND('Comment'), 404);
    }

    if (comment.author.equals(req.userId) || req.accessRole.includes(1)) {
      res.status(200).json(comment);
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }
  });

  router.delete('/comments/:commentId', async (req, res) => {
    const { commentId } = req.params;
    const _id = ObjectId(commentId);

    const comment = await Comment.findById({ _id });

    if (comment.author.equals(req.userId) || req.accessRole.includes(1)) {
      await Comment.findByIdAndDelete({ _id });
      res.status(200).json('Deleted');
    } else {
      throw new CustomError(errorMessages.ACCESS_CLOSED, 403);
    }
  });

  return router;
};
