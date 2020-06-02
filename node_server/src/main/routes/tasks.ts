import express, { Router } from 'express';
import mongoose from 'mongoose';
import { TaskModel, createTaskModel, TaskDoc } from '../models/task';

const router = express.Router();

/**
 * Simple message controller for response messages.
 */
const messenger = {
  queryError: 'Theres an error in the query',
  noTaskFound: 'No task matches the ID',
  queryNotAllowed:
    'Please specify a task ID by using /api/tasks/2 where "2" is the ID of the task.',
  noEmptyStrings: 'Tasks cannot contain empty strings.',
  taskDeleted: (title: string): string => {
    return `Task Deleted: ${title}`;
  },
  queryIdError: (taskId: string): string => {
    return `no task found matching ${taskId}`;
  },
  errorBlank: (err: Error, ...params: Array<object>): object => {
    return {
      thrownError: err,
      params: params,
    };
  },
};

/**
 * Creates the task endpoint Router.
 *
 * @param {mongoose} db The mongoose DB connection.
 * @returns {Router} returns the built Router.
 */
function createTasksRouter(db: typeof mongoose): Router {
  const Task: TaskModel = createTaskModel(db);

  router.get('/', (req, res) => {
    res.status(405).send(messenger.queryNotAllowed);
  });

  /**
   * Checks for the existance of a task.
   *
   * @param {string} taskId Task id to find
   * @returns {Promise<TaskDoc>} promise created to handle the check when completed.
   */
  function checkTaskid(taskId: string): Promise<TaskDoc> {
    return new Promise<TaskDoc>((resolve, reject) => {
      Task.findOne({ _id: taskId }).exec((err, foundTask) => {
        if (err) {
          reject(err);
        } else if (foundTask === (undefined || null)) {
          const err = new Error(messenger.queryIdError(taskId));
          reject(err);
        } else {
          resolve(foundTask);
        }
      });
    });
  }

  /**
   * GET request, finds one TaskDoc that matches the ID.
   */
  router.get('/:taskId', (req, res) => {
    checkTaskid(req.params.taskId)
      .then(foundTask => {
        res.status(200).json(foundTask);
      })
      .catch(err => {
        res.status(400).send(err);
      });
  });

  /**
   * POST request, finds a task and posts a new TaskDoc to it.
   */
  router.post('/:taskId', async (req, res) => {
    try {
      const foundTask = await checkTaskid(req.params.taskId);
      if (req.body) {
        await foundTask.save();
        res.status(201).json(foundTask);
      }
    } catch (err) {
      res.status(400).json(err);
    }
  });

  /**
   * PATCH request, finds the task by ID and replaces the data.
   */
  router.patch('/:taskId', (req, res, next) => {
    checkTaskid(req.params.taskId)
      .then(taskDoc => {
        if (req.body && req.body.title) {
          return taskDoc;
        } else {
          throw new Error(messenger.queryIdError(req.params.taskId));
        }
      })
      .then(taskDoc => {
        if (req.body._id) {
          delete req.body._id;
        }

        taskDoc = Object.assign(taskDoc, req.body);
        taskDoc.save();
        res.status(200).json(taskDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * DETETE request, removes a TaskDoc from the database.
   */
  router.delete('/:taskId', (req, res) => {
    Task.deleteOne({ _id: req.params.taskId })
      .then(delTask => {
        res.status(200).json(delTask);
      })
      .catch(err => {
        res.status(400).json(err);
      });
  });

  return router;
}

export default createTasksRouter;
