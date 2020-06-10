import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import authGithubRouter from './authGithub';

/**
 * Creates the express Router for the `/auth` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  router.use('/github', authGithubRouter(db));
  return router;
}

export default createApiRouter;
