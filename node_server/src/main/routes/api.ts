import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import projectsRouter from './projects';
import usersRouter from './users';
import tasksRouter from './tasks';

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  router.get('/', (req, res) => {
    res.send('Please use an endpoint');
  });

  router.use('/projects', projectsRouter(db));
  router.use('/users', usersRouter(db));
  router.use('/tasks', tasksRouter(db));
  return router;
}

export default createApiRouter;
