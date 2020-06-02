import express, { Router } from 'express';
import mongoose from 'mongoose';
import { TaskModel, createTaskModel, TaskDoc } from '../models/task';

const router = express.Router();

const messenger = {
  queryError: 'Theres an error in the query',
  noTaskFound: 'No task matches the ID',
  queryNotAllowed:
    'Please specify a task ID by using /api/tasks/2 where "2" is the ID of the task.',
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
  console.log('in createTasksRouter');
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
    console.log('did it actually use checkTaskId');
    return new Promise<TaskDoc>((resolve, reject) => {
      Task.findOne({ _id: taskId }).exec((err, foundTask) => {
        if (err) {
          // REMOVE LATER
          console.log('in checkTaskId/findbyid/iferr');
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

  router.get('/:taskId', (req, res) => {
    console.log('in first part of GET');
    checkTaskid(req.params.taskId)
      .then(foundTask => {
        // REMOVE LATER
        console.log(JSON.stringify(foundTask, null, 2));
        res.status(200).json(foundTask);
      })
      .catch(err => {
        // REMOVE LATER
        const errLoc = 'in api/tasks/:taskId - CATCH';
        console.log(errLoc);
        console.log(JSON.stringify(err, null, 2));
        res.status(400).send(err);
      });
  });

  router.post('/:taskId', async (req, res) => {
    try {
      const foundTask = await checkTaskid(req.params.taskId);
      if (req.body) {
        const newTask = new Task(req.body);
        await newTask.save();

        foundTask.subTask.push(newTask._id);
        await foundTask.save();
        res.status(200).json(newTask);
      }
    } catch (err) {
      res.status(200).json(err);
    }
  });

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

  router.delete('/:taskId', async (req, res) => {
    try {
      const foundTask = await checkTaskid(req.params.taskId);
      await Task.findByIdAndDelete(foundTask._id).exec((err, delTask) => {
        if (err) {
          console.log(err);
          res.status(500).json(err);
        } else if (delTask) {
          // res.status(200).send(messenger.taskDeleted(foundTask.title));
          res.status(200).json(foundTask);
        }
      });
    } catch (err) {
      res.status(500).json(err);
    }
  });

  return router;
}

export default createTasksRouter;
