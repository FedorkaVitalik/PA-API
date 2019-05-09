const mongoose = require('../utils/mongoose.js');

const collectionNames = require('../constants/collections.js');
const createAdmin = require('../utils/createAdmin');

const { Schema } = mongoose;

const UserSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: 'Email address is required',
    /* eslint max-len: ["error", { "ignoreRegExpLiterals": true }] */
    match: [
      // eslint-disable-next-line no-useless-escape
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      'Please fill a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'User password is required']
  },
  fname: {
    type: String,
    required: [true, 'User first name is required']
  },
  lname: {
    type: String,
    required: [true, 'User last name is required']
  },
  token: {
    type: String
  },
  refreshToken: {
    type: String
  },
  accessRole: {
    type: Array,
    default: [2]
  }
});

const User = mongoose.model(collectionNames.User, UserSchema);

createAdmin(User);

module.exports = User;
