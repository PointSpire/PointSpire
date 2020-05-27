import express, { Router } from 'express';
import mongoose from 'mongoose';
import {
  ProjectModel,
  ProjectDoc,
  createProjectModel,
} from '../models/project';
import { createTaskModel, TaskModel } from '../models/task';

const router = express.Router();

const errorDescriptions = {
  mongoProjectFindErr: 'There was an error while finding the project.',
  projectNotFound(id: string): string {
    return `The project with ID: ${id} was not found.`;
  },
  taskNotDefined:
    `The task was not defined either with a proper body or with` +
    ` the "taskTitle" defined.`,
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
   * Returns the project document with the specified ID.
   */
  router.get('/:projectId', (req, res, next) => {
    checkProjectId(req.params.projectId)
      .then(projectDoc => {
        res.status(200);
        res.json(projectDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Creates a new subtask for the given project ID. If successful, it returns
   * the newly created task.
   */
  router.post('/:projectId/subtasks', (req, res, next) => {
    checkProjectId(req.params.projectId)
      .then(projectDoc => {
        if (req.body && req.body.taskTitle) {
          const newTask = new Task({
            title: req.body.taskTitle,
          });
          newTask.save();
          projectDoc.subtasks.push(newTask._id);
          projectDoc.save();
          res.status(201);
          res.json(newTask);
        } else {
          throw new Error(errorDescriptions.taskNotDefined);
        }
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Updates the project with the given projectId and overwrites any of its
   * values specified in the request body. If successful, it returns the
   * updated document.
   */
  router.patch('/:projectId', (req, res, next) => {
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
        if (req.body._id) {
          delete req.body._id;
        }

        projectDoc = Object.assign(projectDoc, req.body);
        projectDoc.save();
        res.status(200);
        res.json(projectDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Deletes the project with the given projectId. If successful, it returns
   * the deleted document.
   */
  router.delete('/:projectId', (req, res, next) => {
    checkProjectId(req.params.projectId)
      .then(projectDoc => {
        Project.deleteOne({ _id: req.params.projectId });
        res.status(200);
        res.json(projectDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  return router;
}

export default createProjectsRouter;
