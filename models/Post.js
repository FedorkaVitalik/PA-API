const mongoose = require('../utils/mongoose.js');

const collectionNames = require('../constants/collections.js');

const { Schema } = mongoose;

const PostSchema = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    required: true
  },
  date: {
    type: Date
  }
});

const Post = mongoose.model(collectionNames.Post, PostSchema);

module.exports = Post;
