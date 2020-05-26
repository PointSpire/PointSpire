import express, { Router } from 'express';
import mongoose from 'mongoose';
import { ProjectModel, createProjectModel } from '../models/project';
import { UserModel, createUserModel, UserDoc } from '../models/user';

const router = express.Router();

const errorDescriptions = {
  mongoUserFindErr: 'There was an error while finding the user.',
  userNotFound(id: string): string {
    return `The user with ID: ${id} was not found.`;
  },
  projectNotDefined:
    `The project was not defined either with a proper body or with` +
    ` the "projectTitle" defined.`,
  userUpdateNotDefined:
    `No content was provided in the body to update ` + `the user with.`,
  newUserDetailsNotDefined:
    `Details for the new user were not specified in ` +
    `the body of the message. Please define at least the userName in the body.`,
};

/**
 * Creates the express Router for the `/users` endpoint.
 *
 * @param {mongoose} db the connected MongoDB database
 * @returns {Router} the Router for the `/users` endpoint
 */
function createUsersRouter(db: typeof mongoose): Router {
  const User: UserModel = createUserModel(db);
  const Project: ProjectModel = createProjectModel(db);

  router.get('/', (req, res) => {
    res.status(405);
    res.send(
      'Please specify a user ID by using /api/users/24 where ' +
        '"24" is the ID of the user.'
    );
  });

  /**
   * Adds a new user to the database with the provided userName. If successful,
   * it returns the new user document.
   */
  router.post('/', (req, res) => {
    if (req.body && req.body.userName) {
      if (req.body._id) {
        delete req.body._id;
      }
      let newUser = new User({ userName: req.body.userName });
      newUser = Object.assign(newUser, req.body);
      newUser.save();
      res.status(201);
      res.json(newUser);
    } else {
      res.status(400);
      res.send(errorDescriptions.newUserDetailsNotDefined);
    }
  });

  /**
   * Checks the given userId in the MongoDB and if there is an error it
   * then "rejects" the promise with the error so it can be used elsewhere.
   * If this is successful, it returns the user document.
   *
   * @param {string} userId the ID of the user to find
   * @returns {Promise<UserDoc>} the promise that will reject if there is
   * an error or if the doc is not found and resolves if the user document
   * is found
   */
  function checkUserId(userId: string): Promise<UserDoc> {
    return new Promise<UserDoc>((resolve, reject) => {
      User.find({ _id: userId }).exec((err, users) => {
        if (err) {
          const updatedErr = Object.assign({}, err, {
            additionalMessage: errorDescriptions.mongoUserFindErr,
          });
          reject(updatedErr);
        } else if (users.length === 0) {
          const err = new Error(errorDescriptions.userNotFound(userId));
          reject(err);
        } else {
          resolve(users[0]);
        }
      });
    });
  }

  /**
   * Gets a user with the spcified userId. If successful, it returns the user
   * document.
   */
  router.get('/:userId', (req, res, next) => {
    checkUserId(req.params.userId)
      .then(userDoc => {
        res.json(userDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Creates a new project for the given user ID. If successful, it returns
   * the newly created project.
   */
  router.post('/:userId/projects', (req, res, next) => {
    checkUserId(req.params.userId)
      .then(userDoc => {
        if (req.body && req.body.projectTitle) {
          const newProject = new Project({
            title: req.body.projectTitle,
          });
          newProject.save();
          userDoc.projects.push(newProject._id);
          userDoc.save();
          res.status(201);
          res.json(newProject);
        } else {
          throw new Error(errorDescriptions.projectNotDefined);
        }
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Updates the user with the given userId and overwrites any of its
   * values specified in the request body. If successful, it returns the
   * updated document.
   */
  router.patch('/:userId', (req, res, next) => {
    checkUserId(req.params.userId)
      .then(userDoc => {
        if (req.body) {
          return userDoc;
        } else {
          throw new Error(errorDescriptions.userUpdateNotDefined);
        }
      })
      .then(userDoc => {
        // Make sure no sneaky stuff is happenin 😅
        if (req.body._id) {
          delete req.body._id;
        }

        userDoc = Object.assign(userDoc, req.body);
        userDoc.save();
        res.status(200);
        res.json(userDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  /**
   * Deletes the user with the given userId. If successful, it returns
   * the deleted document.
   */
  router.delete('/:userId', (req, res, next) => {
    checkUserId(req.params.userId)
      .then(userDoc => {
        User.deleteOne({ _id: req.params.userId });
        res.status(200);
        res.json(userDoc);
      })
      .catch(err => {
        next(err);
      });
  });

  return router;
}

export default createUsersRouter;
