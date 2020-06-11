import express, { Router } from 'express';
const router = express.Router();
import authGithubRouter from './authGithub';

/**
 * Creates the express Router for the `/auth` endpoint.
 *
 * @returns {Router} the Router for the `/auth` endpoint
 */
function createApiRouter(): Router {
  router.use('/github', authGithubRouter());
  return router;
}

export default createApiRouter;
