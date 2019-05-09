const mongoose = require('mongoose');

const config = require('../config');
const createAdmin = require('../utils/createAdmin');

mongoose.connect(config.mongoURI).then(() => {
  // eslint-disable-next-line no-console
  console.log('Connected to Mongodb');
  createAdmin();
});

module.exports = mongoose;
