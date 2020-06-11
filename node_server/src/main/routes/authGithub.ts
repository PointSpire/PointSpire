import express, { Router } from 'express';
import mongoose from 'mongoose';
// import {
//   ProjectModel,
//   createProjectModel,
//   ProjectDoc,
//   isProjectDocArr,
// } from '../models/project';
import { UserModel, createUserModel, UserDoc } from '../models/user';
import passport from 'passport';
// import {
//   TaskModel,
//   createTaskModel,
//   isTaskDocArr,
//   TaskDoc,
// } from '../models/task';

const router = express.Router();

// const errorDescriptions = {
//   mongoUserFindErr: 'There was an error while finding the user.',
//   userNotFound(id: string): string {
//     return `The user with ID: ${id} was not found.`;
//   },
//   projectNotDefined:
//     `The project was not defined either with a proper body or with` +
//     ` the "projectTitle" defined.`,
//   userUpdateNotDefined:
//     `No content was provided in the body to update ` + `the user with.`,
//   newUserDetailsNotDefined:
//     `Details for the new user were not specified in ` +
//     `the body of the message. Please define at least the userName in the body.`,
// };

/**
 * Creates the express Router for the `/auth/github` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/auth/github` endpoint
 */
function authGithubRouter(db: typeof mongoose): Router {
  router.get('/', (req, res) => {
    passport.authenticate('github');
  });

  router.get(
    '/cb',
    passport.authenticate('github', { failureRedirect: '/login' }),
    function (req, res) {
      // Successful authentication, redirect home.
      res.redirect('/');
    }
  );

  return router;
}

export default authGithubRouter;
