import express, { Router } from 'express';
import mongoose from 'mongoose';
import { TaskModel, createTaskModel, TaskDoc } from '../models/task';
import { ProjectModel, createProjectModel } from '../models/project';

const router = express.Router();

/**
 * Simple message controller for response messages.
 * Its not really necessary, but fun to write. ;)
 */
const messenger = {
  queryError: 'Theres an error in the query',
  noTaskFound: 'No task matches the ID',
  queryNotAllowed:
    'Please specify a task ID by using /api/tasks/2 where "2" is the ID of the task.',
  noEmptyStrings: 'Tasks cannot contain empty strings.',
  taskNotDefined:
    `The task was not defined either with a proper body or with` +
    ` the "title".`,
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
  const Project: ProjectModel = createProjectModel(db);

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
   * @swagger
   * /tasks/{taskId}:
   *  get:
   *    summary: Gets the task with the specified ID
   *    tags:
   *      - Task
   *    responses:
   *      200:
   *        description: The task was successfully found and returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/taskObjectWithIds'
   *      400:
   *        description: The task ID didn't correspond to one in the database or there was an error while accessing the database.
   *  parameters:
   *  - $ref: '#/components/parameters/taskIdParam'
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
   * @swagger
   * /tasks/{taskId}:
   *  patch:
   *    summary: Updates a task
   *    description: Updates the task with the given taskId and overwrites any of its values specified in the request body. If successful, it returns the updated document.
   *    tags:
   *      - Task
   *    requestBody:
   *      content:
   *        'application/json':
   *          schema:
   *            $ref: '#/components/schemas/taskObjectRequestBody'
   *    responses:
   *      200:
   *        description: The update was successful and the updated task was returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/taskObjectWithIds'
   *      400:
   *        description: There was an error while finding the task or the task ID did not return a project.
   *  parameters:
   *  - $ref: '#/components/parameters/taskIdParam'
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
   * @swagger
   * /tasks/{taskId}/subtasks:
   *  post:
   *    summary: Creates a new subtask of a task
   *    description: Creates a new subtask for the given task ID. If successful, it returns the newly created task.
   *    tags:
   *      - Task
   *    requestBody:
   *      content:
   *        'application/json':
   *          schema:
   *            $ref: '#/components/schemas/taskObjectRequestBody'
   *    responses:
   *      201:
   *        description: The task was succesfully created and the new task is returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/taskObjectWithIds'
   *      400:
   *        description: There was an error while getting the task or saving the new task.
   *  parameters:
   *  - $ref: '#/components/parameters/taskIdParam'
   */
  router.post('/:taskId/subtasks', async (req, res) => {
    try {
      const taskDoc = await checkTaskid(req.params.taskId);
      if (req.body && req.body.title) {
        const newTask = new Task(req.body);

        // Save new task before adding it to subtasks so it has an ID
        await newTask.save();

        taskDoc.subtasks.push(newTask._id);
        await taskDoc.save();
        res.status(201);
        res.json(newTask);
      } else {
        throw new Error(messenger.taskNotDefined);
      }
    } catch (err) {
      res.status(400);
      res.json(err);
    }
  });

  /**
   * @swagger
   * /tasks/{taskId}:
   *  delete:
   *    summary: Deletes a task
   *    description: 'Deletes the task with the given taskId and deletes that taskId
   * from any project which has it in their `subtasks` array. If successful,
   * it returns the deleted document.'
   *    tags:
   *      - Task
   *    responses:
   *      200:
   *        description: The task was successfully deleted and the deleted task was returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/taskObjectWithIds'
   *      400:
   *        description: The task id was not found or there was an error while deleting the task.
   *  parameters:
   *  - $ref: '#/components/parameters/taskIdParam'
   */
  router.delete('/:taskId', async (req, res) => {
    try {
      const taskDoc = await checkTaskid(req.params.taskId);
      await Promise.all([
        Task.deleteOne({ _id: taskDoc._id }).exec(),
        Project.updateOne(
          { subtasks: taskDoc._id },
          { $pull: { subtasks: taskDoc._id } }
        ).exec(),
      ]);
      res.status(200);
      res.json(taskDoc);
    } catch (err) {
      res.status(400).json(err);
    }
  });

  return router;
}

export default createTasksRouter;
