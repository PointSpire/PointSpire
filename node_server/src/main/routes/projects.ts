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

  router.get('/:projectId', (req, res, next) => {
    Project.find({ _id: req.params.projectId }).exec((err, projects) => {
      if (err) {
        console.error(errorDescriptions.mongoProjectFindErr);
        next(err);
      } else {
        res.json(projects);
      }
    });
  });

  /**
   * Creates a new subtask for the given project ID.
   */
  router.post('/:projectId/subtasks', (req, res, next) => {
    // Create a promise to chain the logic
    new Promise<ProjectDoc>((resolve, reject) => {
      Project.find({ _id: req.params.projectId }).exec((err, projects) => {
        if (err) {
          const updatedErr = Object.assign({}, err, {
            additionalMessage: errorDescriptions.mongoProjectFindErr,
          });
          reject(updatedErr);
        } else if (projects.length === 0) {
          const err = new Error(
            errorDescriptions.projectNotFound(req.params.projectId)
          );
          reject(err);
        } else {
          resolve(projects[0]);
        }
      });
    })
      .then(projectDoc => {
        if (req.body && req.body.taskTitle) {
          const newTask = new Task({
            title: req.body.taskName,
          });
          newTask.save();
          projectDoc.subtasks.push(newTask._id);
          projectDoc.save();
        } else {
          throw new Error(errorDescriptions.taskNotDefined);
        }
      })
      .catch(err => {
        next(err);
      });
  });

  return router;
}

export default createProjectsRouter;
