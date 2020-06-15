import express, { Router } from 'express';
const router = express.Router();
import authGithubRouter from './authGithub';
import mongoose from 'mongoose';

/**
 * Creates the express Router for the `/auth` endpoint.
 *
 * @param {typeof mongoose} db the connected mongoDB database
 * @returns {Router} the Router for the `/auth` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  router.use('/github', authGithubRouter(db));
  return router;
}

export default createApiRouter;
