import express from 'express';
import session from 'express-session';
import path from 'path';
import dotenv from 'dotenv';
import logger from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import cors from 'cors';

/**
 * Allows usage of the .env file in the root directory of `node_server`. Should
 * be called as early as possible.
 */
dotenv.config();

import indexRouter from './src/main/routes/index';
import apiRouter from './src/main/routes/api';
import authRouter from './src/main/routes/auth';

/**
 * @fires started when the server is finished setting up and connected to
 * the database as well as listening
 */
const app = express();

const server = http.createServer(app);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

/**
 * Sets up logging for the application. If the environment variable `NODE_ENV`
 * is set to `test` then logging is disabled.
 */
function setupLogger(): void {
  if (process.env.NODE_ENV !== 'test') {
    app.use(logger('dev'));
  }
}

setupLogger();
app.use(
  cors({
    origin: (origin, callback) => {
      callback(null, true);
    },
    preflightContinue: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const sess = {
  secret: 'keyboard cat',
  cookie: {
    secure: false,
  },
  resave: true,
  saveUninitialized: true,
};

// serve secure cookie in production environment
if (app.get('env') === 'production') {
  app.set('trust proxy', 1);
  sess.cookie.secure = true;
}

app.use(session(sess));

/**
 * Represents the connection options for the mongoose MongoDB connection.
 */
const mongooseConnectionOptions = {
  // Fixes deprecation warning
  useNewUrlParser: true,

  // Fixes deprecation warning
  useUnifiedTopology: true,
};

/**
 * Sets up the routes for the application.
 *
 * @param {mongoose} db The connected MnogoDB object
 */
function setupRoutes(db: typeof mongoose): void {
  app.use('/', indexRouter);
  app.use('/api', apiRouter(db));
  app.use('/auth', authRouter(db));
}

/**
 * Normalize a port into a number, string, or false.
 *
 * @param {string} val the port value to normalize
 * @returns {boolean|number|string} the normalized port
 */
function normalizePort(val: string): boolean | number | string {
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

/**
 * Reports the binding of the server and emits the `started` event on the app.
 */
function onListening(): void {
  const addr = server.address();
  let binding = 'unknown';
  if (addr !== null) {
    binding = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  }
  console.log(`Listening on ${binding}`);
  app.emit('started');
}

/**
 * Listen on provided port, on all network interfaces.
 */
function startServer(): void {
  const port = normalizePort(process.env.PORT || '8055');
  app.set('port', port);
  server.listen(port);
  server.on('listening', onListening);
}

// Connect to the database
new Promise<string>((resolve, reject) => {
  if (process.env.MONGODB_DEV_URL) {
    const url: string = process.env.MONGODB_DEV_URL;
    resolve(url);
  } else {
    reject(new Error('MONGODB_DEV_URL is undefined in the .env file.'));
  }
})
  .then(url => {
    return mongoose.connect(url, mongooseConnectionOptions, err => {
      if (err) {
        console.error('Database connection could not be established');
        console.error(err);
      }
    });
  })
  .then(db => {
    console.log('Connection successfully made to the database');
    setupRoutes(db);

    startServer();
  })
  .catch(err => {
    console.error(err.message);
  });

export default app;
