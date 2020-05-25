import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import { TaskModel, createTaskModel } from '../models/task';
import projectsRouter from './projects';

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose): Router {
  const Task: TaskModel = createTaskModel(db);

  router.get('/', (req, res) => {
    res.send('Please use an endpoint');
  });

  router.use('/projects', projectsRouter(db));

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
  return router;
}

export default createApiRouter;
