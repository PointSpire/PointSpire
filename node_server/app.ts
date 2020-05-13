const createError = require('http-errors');
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
const cookieParser = require('cookie-parser');
const logger = require('morgan');
import mongoose from 'mongoose';

/**
 * Allows usage of the .env file in the root directory of `node_server`. Should
 * be called as early as possible.
 */
dotenv.config();

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const apiRouter = require('./routes/api');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Represents the connection options for the mongoose MongoDB connection.
 */
const mongooseConnectionOptions = {
  // Fixes deprecation warning
  useNewUrlParser: true,

  // Fixes deprecation warning
  useUnifiedTopology: true,
};

// Connect to the database
new Promise<string>((resolve, reject) => {
  if (process.env.MONGODB_DEV_URL) {
    const url: string = process.env.MONGODB_DEV_URL;
    resolve(url);
  } else {
    console.error("MONGODB_DEV_URL is undefined in the .env file.");
    reject();
  }
}).then(url => {
  return mongoose.connect(url, mongooseConnectionOptions, err => {
    if (err) {
      console.error('Database connection could not be established');
      console.error(err);
    }
  })
}).then(db => {
  console.log('Connection successfully made to the database');
  setupRoutes(db);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

/**
 * Sets up the routes for the application.
 *
 * @param {mongoose} db The connected MnogoDB object
 */
function setupRoutes(db: typeof mongoose) {
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/api', apiRouter(db));
}

module.exports = app;
