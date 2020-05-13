import express, { Router } from 'express';
const router = express.Router();
import mongoose from 'mongoose';
import {Task} from '../models/task';

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose) : Router {
  router.get('/', (req, res, next) => {
    res.send('Please use an endpoint');
  });

  // tasks endpoint for all the tasks in the database
  router.get('/tasks', (req, res, next) => {});
  return router;
}

module.exports = createApiRouter;
