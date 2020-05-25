import express, { Router } from 'express';
import mongoose from 'mongoose';
import { ProjectModel, createProjectModel } from '../models/project';

const router = express.Router();

/**
 * Creates the express Router for the `/projects` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/projects` endpoint
 */
function createProjectsRouter(db: typeof mongoose): Router {
  const Project: ProjectModel = createProjectModel(db);

  router.get('/', (req, res) => {
    res.status(405);
    res.send(
      'Please specify a project ID by using /api/projects/24 where ' +
        '"24" is the ID of the project.'
    );
  });

  router.get('/projects', (req, res, next) => {
    Project.find().exec((err, tasks) => {
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

export default createProjectsRouter;
