import express, { Router } from 'express';
import mongoose from 'mongoose';
const router = express.Router();

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {import('mongoose')} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db: typeof mongoose) : Router {
  const Task = createTaskClass(db);

  router.get('/', (req, res, next) => {
    res.send('Please use an endpoint');
  });

  // tasks endpoint for all the tasks in the database
  router.get('/tasks', (req, res, next) => {});
  return router;
}

/**
 * Creates a `Task` class that represents a task in the MongoDB.
 *
 * This can be used for example with:
 * ```
 * let newTask = new Task({title: 'A new task'});
 * ```
 *
 * @param {import('mongoose')} db the connected MongoDB instance
 * @returns {Task} the compiled mongoose model which is the
 *    equivalent of a `Task` class
 */
function createTaskClass(db: typeof mongoose) {
  const taskSchema = new db.Schema({
    title: String,
    note: String,
    date: { type: Date, default: Date.now },
    author: mongoose.Schema.Types.ObjectId,
  });

  const Task = db.model('Task', taskSchema);

  /**
   * `Task` class that represents a task in the MongoDB.
   */
  return Task;
}

module.exports = createApiRouter;
