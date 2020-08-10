import express, { Router } from 'express';
import mongoose from 'mongoose';
import {
  ProjectModel,
  ProjectDoc,
  createProjectModel,
} from '../models/project';
import { createTaskModel, TaskModel } from '../models/task';
import { createUserModel, UserModel } from '../models/user';

const router = express.Router();

const errorDescriptions = {
  mongoProjectFindErr: 'There was an error while finding the project.',
  projectNotFound(id: string): string {
    return `The project with ID: ${id} was not found.`;
  },
  taskNotDefined:
    `The task was not defined either with a proper body or with` +
    ` the "title".`,
  projectUpdateNotDefined:
    `No content was provided in the body to update ` + `the project with.`,
};

/**
 * Creates the express Router for the `/projects` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/projects` endpoint
 */
function createProjectsRouter(db: typeof mongoose): Router {
  const Project: ProjectModel = createProjectModel(db);
  const Task: TaskModel = createTaskModel(db);
  const User: UserModel = createUserModel(db);

  router.get('/', (req, res) => {
    res.status(405);
    res.send(
      'Please specify a project ID by using /api/projects/24 where ' +
        '"24" is the ID of the project.'
    );
  });

  /**
   * Checks the given projectId in the MongoDB and if there is an error it
   * then "rejects" the promise with the error so it can be used elsewhere.
   * If this is successful, it returns the project document.
   *
   * @param {string} projectId the ID of the project to find
   * @returns {Promise<ProjectDoc>} the promise that will reject if there is
   * an error or if the doc is not found and resolves if the project document
   * is found
   */
  function checkProjectId(projectId: string): Promise<ProjectDoc> {
    return new Promise<ProjectDoc>((resolve, reject) => {
      Project.find({ _id: projectId }).exec((err, projects) => {
        if (err) {
          const updatedErr = Object.assign({}, err, {
            additionalMessage: errorDescriptions.mongoProjectFindErr,
          });
          reject(updatedErr);
        } else if (projects.length === 0) {
          const err = new Error(errorDescriptions.projectNotFound(projectId));
          reject(err);
        } else {
          resolve(projects[0]);
        }
      });
    });
  }

  /**
   * @swagger
   * /projects/{projectId}:
   *  get:
   *    summary: Gets the project with the specified ID
   *    tags:
   *      - Project
   *    responses:
   *      200:
   *        description: The project was successfully found and returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/completableObjectResponse'
   *      400:
   *        description: The project ID didn't correspond to one in the database or there was an error while accessing the database.
   *  parameters:
   *  - $ref: '#/components/parameters/projectIdParam'
   */
  router.get('/:projectId', (req, res) => {
    checkProjectId(req.params.projectId)
      .then(projectDoc => {
        res.status(200);
        res.json(projectDoc);
      })
      .catch(err => {
        res.status(400);
        res.json(err);
      });
  });

  /**
   * @swagger
   * /projects/{projectId}/subtasks:
   *  post:
   *    summary: Creates a new subtask of a project
   *    description: Creates a new subtask for the given project ID. If successful, it returns the newly created task.
   *    tags:
   *      - Project
   *      - Task
   *    requestBody:
   *      content:
   *        'application/json':
   *          schema:
   *            $ref: '#/components/schemas/completableObjectPostBody'
   *    responses:
   *      201:
   *        description: The task was succesfully created and the new task is returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/completableObjectResponse'
   *      400:
   *        description: There was an error while saving the task or getting the project
   *  parameters:
   *  - $ref: '#/components/parameters/projectIdParam'
   */
  router.post('/:projectId/subtasks', async (req, res) => {
    try {
      const projectDoc = await checkProjectId(req.params.projectId);
      if (req.body && req.body.title) {
        const newTask = new Task(req.body);

        // Save task before adding it to the project so it has an ID
        await newTask.save();

        projectDoc.subtasks.push(newTask._id);
        await projectDoc.save();
        res.status(201);
        res.json(newTask);
      } else {
        throw new Error(errorDescriptions.taskNotDefined);
      }
    } catch (err) {
      res.status(400);
      res.json(err);
    }
  });

  /**
   * @swagger
   * /projects/{projectId}:
   *  patch:
   *    summary: Updates a project
   *    description: Updates the project with the given projectId and overwrites any of its values specified in the request body. If successful, it returns the updated document.
   *    tags:
   *      - Project
   *    requestBody:
   *      content:
   *        'application/json':
   *          schema:
   *            $ref: '#/components/schemas/completableObjectPatchBody'
   *    responses:
   *      200:
   *        description: The update was successful and the updated project was returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/completableObjectResponse'
   *      400:
   *        description: There was an error while finding the project or the project ID did not return a project.
   *  parameters:
   *  - $ref: '#/components/parameters/projectIdParam'
   */
  router.patch('/:projectId', (req, res) => {
    checkProjectId(req.params.projectId)
      .then(projectDoc => {
        if (req.body) {
          return projectDoc;
        } else {
          throw new Error(errorDescriptions.projectUpdateNotDefined);
        }
      })
      .then(projectDoc => {
        // Make sure no sneaky stuff is happenin 😅
        if (req.body._id || req.body.__v) {
          delete req.body._id;
          delete req.body.__v;
        }

        projectDoc = Object.assign(projectDoc, req.body);
        projectDoc.save();
        res.status(200);
        res.json(projectDoc);
      })
      .catch(err => {
        res.status(400).send(err);
      });
  });

  /**
   * @swagger
   * /projects/{projectId}:
   *  delete:
   *    summary: Deletes a project
   *    description: 'Deletes the project with the given projectId and deletes that projectId
   * from any user which has it in their `projects` array. If successful,
   * it returns the deleted document.'
   *    tags:
   *      - Project
   *    responses:
   *      200:
   *        description: The project was successfully deleted and the deleted project was returned
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/completableObjectResponse'
   *      400:
   *        description: The project id was not found or there was an error while deleting the project.
   *  parameters:
   *  - $ref: '#/components/parameters/projectIdParam'
   */
  router.delete('/:projectId', async (req, res) => {
    try {
      const projectDoc = await checkProjectId(req.params.projectId);
      await Promise.all([
        Project.deleteOne({ _id: projectDoc._id }).exec(),
        User.updateOne(
          { projects: projectDoc._id },
          { $pull: { projects: projectDoc._id } }
        ).exec(),
      ]);
      res.status(200);
      res.json(projectDoc);
    } catch (err) {
      res.status(400).json(err);
    }
  });

  /**
   * @swagger
   * /projects/validate:
   *   post:
   *     summary: 'Validates that the provided object is a valid Project object'
   *     tags:
   *       - Project
   *     requestBody:
   *       description: 'The object to test'
   *       required: true
   *     responses:
   *       '200':
   *         description: 'The project validation has completed and the result is in the response.'
   *         content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/validationResponse'
   *       '400':
   *         description: 'The body was not provided'
   */
  router.post('/validate', (req, res) => {
    if (req.body) {
      const userDocToTest = new Project(req.body);
      userDocToTest.validate(err => {
        if (err) {
          res.status(200).json({
            validated: false,
            err,
          });
        } else {
          res.status(200).json({
            validated: true,
          });
        }
      });
    } else {
      res
        .status(400)
        .send('Body not provided. Please provide body to validate.');
    }
  });

  /**
   * @swagger
   * /projects/validate-all:
   *    post:
   *      summary: 'Validates that the provided array of objects are all a valid Project object'
   *      tags:
   *        - Project
   *      requestBody:
   *        description: 'The array of objects to test'
   *        required: true
   *        content:
   *          'application/json':
   *            schema:
   *              type: 'array'
   *      responses:
   *        '200':
   *          description: 'The project validation has completed and the result is in the response.'
   *          content:
   *            'application/json':
   *              schema:
   *                $ref: '#/components/schemas/validationResponse'
   *        '400':
   *          description: "The body was not provided or the body was not an array"
   */
  router.post('/validate-all', (req, res) => {
    if (req.body && Array.isArray(req.body)) {
      if (req.body.length !== 0) {
        const userDocToTest = new Project(req.body);
        userDocToTest.validate(err => {
          if (err) {
            res.status(200).json({
              validated: false,
              err,
            });
          } else {
            res.status(200).json({
              validated: true,
            });
          }
        });
      } else {
        res.status(200).json({
          validated: true,
        });
      }
    } else {
      res
        .status(400)
        .send(
          "Body not provided or wasn't an array. Please provide body to validate."
        );
    }
  });

  return router;
}

export default createProjectsRouter;
