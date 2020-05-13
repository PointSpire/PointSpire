const createError = require('http-errors');
import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
const cookieParser = require('cookie-parser');
const logger = require('morgan');
import mongoose, { Error } from 'mongoose';
import http from 'http';
const debug = require('debug')('node-server:server');

/**
 * Allows usage of the .env file in the root directory of `node_server`. Should
 * be called as early as possible.
 */
dotenv.config();

const indexRouter = require('./src/main/routes/index');
import apiRouter from './src/main/routes/api';

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

/**
 * Sets up the routes for the application.
 *
 * @param {mongoose} db The connected MnogoDB object
 */
function setupRoutes(db: typeof mongoose) {
  app.use('/', indexRouter);
  app.use('/api', apiRouter(db));
}

const server = http.createServer(app);

/**
 * Normalize a port into a number, string, or false.
 *
 * @param {string} val
 */
function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onListening() {
  const addr = server.address();
  let binding: string = 'unknown';
  if (addr !== null) {
    binding = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  }
  console.log('Listening on ' + binding);
}

/**
 * Listen on provided port, on all network interfaces.
 */
const port = normalizePort(process.env.PORT || '8055');
app.set('port', port);
server.listen(port);
server.on('listening', onListening);

export default app;
