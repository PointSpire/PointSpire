import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import cookieParser = require('cookie-parser');
import logger from 'morgan';
import mongoose from 'mongoose';
import http from 'http';
import passport from 'passport';
import { Strategy as GithubStrategy } from 'passport-github';
import { UserModel, createUserModel, UserDoc } from './src/main/models/user';

/**
 * Allows usage of the .env file in the root directory of `node_server`. Should
 * be called as early as possible.
 */
dotenv.config();

import indexRouter from './src/main/routes/index';
import apiRouter from './src/main/routes/api';
import authRouter from './src/main/routes/auth';
import loginRouter from './src/main/routes/login';
import { userInfo } from 'os';

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
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Configure Passport authenticated session persistence
 *
 * In order to restore authentication state across HTTP requests, Passport needs
 * to serialize users into and deserialize users out of the session.
 */
passport.serializeUser(function (user, cb) {
  cb(null, user);
});

passport.deserializeUser(function (obj, cb) {
  cb(null, obj);
});

/**
 * Initialize Passport and restore authentication state, if any, from the
 * session.
 */
app.use(passport.initialize());
app.use(passport.session());

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
  app.use('/auth', authRouter());
  app.use('/login', loginRouter);
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

    /**
     * Configure the Github strategy for use by Passport
     *
     * OAuth 2.0-based strategies require a `verify` function wich receives the
     * credential (`accessToken`) for accessing the Github API on the user's
     * behalf, along with the user's profile. The function must invoke `cb`
     * with a user object, wich will be set at `req.usr` in route handlers after
     * authentication.
     */
    passport.use(
      new GithubStrategy(
        {
          clientID: process.env.GITHUB_CLIENT_ID || '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
          callbackURL: 'https://point-spire.herokuapp.com/auth/github/callback',
        },
        function (accessToken, refreshToken, profile, cb) {
          const User: UserModel = createUserModel(db);
          let newUser = new User({ userName: profile.username });
          newUser = Object.assign(newUser, {
            userName: profile.username,
            firstName: '',
            lastName: '',
            githubId: profile.id,
          });

          newUser
            .save()
            .then(() => {
              console.log(newUser);
              cb(null, newUser);
            })
            .catch(error => {
              console.log(error);
            });
        }
      )
    );

    startServer();
  })
  .catch(err => {
    console.error(err.message);
  });

export default app;
