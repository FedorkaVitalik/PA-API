/* eslint-disable no-console */
const mongoose = require('mongoose');

const config = require('../config');

mongoose.connect(
  config.mongoURI,
  { useNewUrlParser: true }
);
mongoose.set('useCreateIndex', true);
mongoose.set('useFindAndModify', false);

module.exports = mongoose;
