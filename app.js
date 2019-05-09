/* eslint-disable no-console */
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const logger = require('morgan');

const urlencodedParser = bodyParser.urlencoded({
  extended: false
});

const config = require('./config');

/* eslint-disable global-require */
require('express-async-errors');

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

router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 422).json(err.message);
});

app.use(router);

server.listen(config.port, () => {
  console.log(`Server has been started on port ${config.port}`);
});
