import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import projectsRouter from './projects';
import usersRouter from './users';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from '../swagger';
import tasksRouter from './tasks';

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  router.use('/projects', projectsRouter(db));
  router.use('/users', usersRouter(db));
  router.use('/tasks', tasksRouter(db));

  /**
   * Setup the swagger front end for the API. This needs to be specified last
   * so that it doesn't get in the way of the other paths.
   */
  router.use('/', swaggerUI.serve, swaggerUI.setup(swaggerSpec));
  return router;
}

export default createApiRouter;
