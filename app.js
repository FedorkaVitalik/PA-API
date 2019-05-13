/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const logger = require('morgan');

const config = require('./config');

const signup = require('./routes/signup');
const login = require('./routes/login');
const logout = require('./routes/logout');
const profile = require('./routes/profile');

const post = require('./routes/post');
const comment = require('./routes/comment');
const follow = require('./routes/follow');

/* eslint-disable global-require */
require('express-async-errors');

const urlencodedParser = bodyParser.urlencoded({
  extended: false
});

const app = express();
const server = http.createServer(app);
const router = express.Router();

app.use(urlencodedParser);
app.use(bodyParser.json());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, OPTIONS, PUT, PATCH, DELETE'
  );

  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, x-access-token, Content-Type, Accept'
  );
  next();
});

// eslint-disable-next-line consistent-return
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(logger('dev'));

router.use('/api', signup());
router.use('/api', login());
router.use('/api', logout());
router.use('/api', profile());

router.use('/api', post());
router.use('/api', comment());
router.use('/api', follow());

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 422).json(err.message);
});

app.use(router);

server.listen(config.port, () => {
  console.log(`Server has been started on port ${config.port}`);
});
