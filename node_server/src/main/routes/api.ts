import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import { TaskModel, createTaskModel } from '../models/task';
import projectsRouter from './projects';
import usersRouter from './users';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from '../swagger';

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  const Task: TaskModel = createTaskModel(db);

  router.use('/projects', projectsRouter(db));
  router.use('/users', usersRouter(db));

  // tasks endpoint for all the tasks in the database
  router.get('/tasks', (req, res, next) => {
    Task.find().exec((err, tasks) => {
      if (err) {
        console.error(
          'There was an error while querying tasks in the database'
        );
        next(err);
      } else {
        res.json(tasks);
      }
    });
  });

  /**
   * Setup the swagger front end for the API. This needs to be specified last
   * so that it doesn't get in the way of the other paths.
   */
  router.use('/', swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  return router;
}

export default createApiRouter;
