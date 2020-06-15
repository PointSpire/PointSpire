import express, { Router } from 'express';
import passport from 'passport';

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
 * @returns {Router} the Router for the `/auth/github` endpoint
 */
function authGithubRouter(): Router {
  router.get('/', passport.authenticate('github'));

  router.get(
    '/callback',
    passport.authenticate('github', { failureRedirect: '/login' })
  );

  return router;
}

export default authGithubRouter;
