import express, { Router } from 'express';
import mongoose from 'mongoose';
import {
  ProjectModel,
  createProjectModel,
  ProjectDoc,
  isProjectDocArr,
} from '../models/project';
import { UserModel, createUserModel, UserDoc } from '../models/user';
import { TaskModel, createTaskModel } from '../models/task';

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
  const Task: TaskModel = createTaskModel(db);

  router.get('/', (req, res) => {
    res.status(405);
    res.send(
      'Please specify a user ID by using /api/users/24 where ' +
        '"24" is the ID of the user.'
    );
  });

  /**
   * @swagger
   * /users:
   *  post:
   *    summary: Creates a new user with the details specified in the body
   *    requestBody:
   *      description: The properties of the new user to be created
   *      required: true
   *      content:
   *        'application/json':
   *          schema:
   *            type: 'object'
   *            required: ['userName']
   *            properties:
   *              'userName':
   *                type: 'string'
   *              'firstName':
   *                type: 'string'
   *              'lastName':
   *                type: 'string'
   *              'githubId':
   *                type: 'string'
   *    responses:
   *      201:
   *        description: The user was successfully created
   *        content:
   *          'application/json':
   *            schema:
   *              $ref: '#/components/schemas/userObjectWithIds'
   *            example:
   *              _id: '5ed5b0b3c38d2174aafc363b'
   *              userName: testUser
   *              dateCreated: '2020-06-02T01:51:47.787Z'
   *              __v: 0
   *      400:
   *        description: The user was not found or there was an error while finding the user
   */
  router.post('/', async (req, res) => {
    if (req.body && req.body.userName) {
      if (req.body._id) {
        delete req.body._id;
      }
      let newUser = new User({ userName: req.body.userName });
      newUser = Object.assign(newUser, req.body);
      await newUser.save();
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
   * @swagger
   * /users/{userId}:
   *   get:
   *     summary: Gets the user at the specified ID
   *     responses:
   *       '200':
   *         description: Successfully returned the user document with the specified userId
   *         content:
   *           'application/json':
   *             schema:
   *               $ref: '#/components/schemas/userObjectWithProjects'
   *   parameters:
   *   - $ref: '#/components/parameters/userIdParam'
   */
  router.get('/:userId', async (req, res) => {
    try {
      const userDoc = await User.findOne({ _id: req.params.userId })
        .populate({
          path: 'projects',
          populate: {
            path: 'subtasks',
          },
        })
        .exec();
      res.status(200);
      res.json(userDoc);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  });

  /**
   * @swagger
   * /users/{userId}/projects:
   *   post:
   *     summary: 'Creates a new project for the user indicated by the userId'
   *     requestBody:
   *       description: 'The properties of the new project to be created'
   *       required: true
   *       content:
   *         'application/json':
   *           schema:
   *             type: 'object'
   *             required: ['title']
   *             properties:
   *               title:
   *                 type: 'string'
   *               note:
   *                 type: 'string'
   *             example:
   *               title: 'Fix the fence'
   *               note: 'Need to visit the store to see what kind of wood they have.'
   *     responses:
   *       '400':
   *         description: 'The userId was not found or there was an error while searching it'
   *   parameters:
   *   - $ref: '#/components/parameters/userIdParam'
   */
  router.post('/:userId/projects', (req, res) => {
    checkUserId(req.params.userId)
      .then(async userDoc => {
        if (req.body && req.body.title) {
          const newProject = new Project(req.body);
          await newProject.save();
          userDoc.projects.push(newProject._id);
          await userDoc.save();
          res.status(201);
          res.json(newProject);
        } else {
          throw new Error(errorDescriptions.projectNotDefined);
        }
      })
      .catch(err => {
        res.status(400);
        res.json(err);
      });
  });

  /**
   * @swagger
   * /users/{userId}:
   *   patch:
   *     summary: Modifies the user at the specified ID
   *     description: Modifies the user at the specified ID with the details provided in the body of the request
   *     requestBody:
   *       description: The new properties of the user. These will overwrite the existing properties.
   *       required: true
   *       content:
   *         'application/json':
   *           schema:
   *             type: 'object'
   *             properties:
   *               'userName':
   *                 type: 'string'
   *               'firstName':
   *                 type: 'string'
   *               'lastName':
   *                 type: 'string'
   *               'githubId':
   *                 type: 'string'
   *     responses:
   *       200:
   *         description: The user was successfully overwritten with the provided data.
   *         content:
   *           'application/json':
   *             schema:
   *               $ref: '#/components/schemas/userObjectWithIds'
   *       400:
   *         description: The userId was not found or there was an error while accessing the database.
   *   parameters:
   *   - $ref: '#/components/parameters/userIdParam'
   */
  router.patch('/:userId', (req, res) => {
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
        res.status(400);
        res.send(err);
      });
  });

  /**
   * Deletes the user with the given userId. If successful, it returns
   * the deleted document.
   */
  router.delete('/:userId', async (req, res) => {
    try {
      // Populate the returned userDoc with the project docs
      const userDoc = await User.findOne({ _id: req.params.userId })
        .populate('projects')
        .exec();

      // Delete each subtask of each project.
      if (userDoc && userDoc.projects && isProjectDocArr(userDoc.projects)) {
        const projects: Array<ProjectDoc> = userDoc.projects;
        await Promise.all(
          projects.map(async project => {
            await Task.deleteMany({
              _id: {
                $in: project.subtasks,
              },
            });
          })
        );
        // Delete the projects
        const projectIds: typeof mongoose.Types.ObjectId[] = projects.map(
          project => {
            return project._id;
          }
        );
        await Project.deleteMany({
          _id: {
            $in: projectIds,
          },
        });
      }
      await User.deleteOne({ _id: req.params.userId }).exec(), res.status(200);
      res.json(userDoc);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  });

  return router;
}

export default createUsersRouter;
