const mongoose = require('../utils/mongoose.js');

const collectionNames = require('../constants/collections.js');

const { Schema } = mongoose;

const CommentSchema = new Schema({
  author: {
    type: Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date
  },
  post: {
    type: Schema.Types.ObjectId,
    required: true
  },
  text: {
    type: String
  }
});

const Comment = mongoose.model(collectionNames.Comment, CommentSchema);

module.exports = Comment;
