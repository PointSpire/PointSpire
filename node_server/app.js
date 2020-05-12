/**
 * Allows usage of the .env file in the root directory of `node_server`. Should
 * be called as early as possible.
 */
require('dotenv').config();

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

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

mongoose
  .connect(process.env.MONGODB_DEV_URL, mongooseConnectionOptions, err => {
    if (err) {
      console.error('Database connection could not be established');
      console.error(err);
    }
  })
  .then(db => {
    console.log('Connection successfully made to the database');
    setupRoutes(db);
  });

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Sets up the routes for the application.
 *
 * @param {import("mongoose")} db The connected MnogoDB object
 */
function setupRoutes(db) {
  app.use('/', indexRouter);
  app.use('/users', usersRouter);
  app.use('/api', apiRouter(db));
}

module.exports = app;
