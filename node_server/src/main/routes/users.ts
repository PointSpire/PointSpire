import express, { Router } from 'express';
import mongoose from 'mongoose';
import {
  ProjectModel,
  createProjectModel,
  ProjectDoc,
  isProjectDocArr,
} from '../models/project';
import { UserModel, createUserModel, UserDoc } from '../models/user';
import { TaskModel, createTaskModel, isTaskDocArr } from '../models/task';

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
   * Adds a new user to the database with the provided userName. If successful,
   * it returns the new user document.
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
   * Generates the populated UserDoc with all of the projects, subtasks, and
   * any levels deep subtasks of that UserDoc.
   *
   * @param {string} userId the userId to use for getting the userDoc
   * @returns {Promise<UserDoc>} the populated UserDoc in Promise form
   */
  async function getPopulatedUserTreeDoc(userId: string): Promise<UserDoc> {
    const userDoc = await User.findOne({ _id: userId })
      .populate({
        path: 'projects',
        populate: {
          path: 'subtasks',
        },
      })
      .exec();
    if (userDoc && userDoc.projects && isProjectDocArr(userDoc.projects)) {
      for (const project of userDoc.projects) {
        if (isTaskDocArr(project.subtasks)) {
          console.log(
            'It got to the inner function of the getPopulatedUserTree' +
              'method.'
          );
          const taskIds = project.subtasks.map(task => {
            return task._id;
          });
          console.log('The taskIds are:', JSON.stringify(taskIds, null, 2));
          const data = await Task.aggregate()
            .match({
              _id: {
                $in: taskIds,
              },
            })
            .graphLookup({
              from: 'Task',
              startWith: taskIds,
              connectFromField: 'subtasks',
              connectToField: '_id',
              as: 'children',
              depthField: 'level',
              maxDepth: 5,
            });
          console.log(`Data for project with id: ${project._id}:
          ${JSON.stringify(data, null, 2)}`);
        }
      }
    }
    if (userDoc) {
      return userDoc;
    } else {
      throw new Error('userDoc was null');
    }
  }

  /**
   * Gets a user with the spcified userId. If successful, it returns the user
   * document and the populated tree of objects.
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
      res.json(userDoc);
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  });

  router.get('/tree/test', async (req, res) => {
    try {
      console.log('It got here 1');
      const testUser = new User({ userName: 'Some tree test user' });
      for (let i = 0; i < 1; i++) {
        console.log('It got here 2');
        const newProject = new Project({ title: 'A test project' });
        for (let j = 0; j < 1; j++) {
          const newTask = new Task({ title: 'Some tree test task' });
          for (let k = 0; k < 1; k++) {
            const newSubTask = new Task({
              title: 'Some subtask of a task for the tree',
            });
            await newSubTask.save();
            newTask.subtasks.push(newSubTask._id);
          }
          await newTask.save();
          newProject.subtasks.push(newTask._id);
        }
        await newProject.save();
        testUser.projects.push(newProject._id);
      }
      await testUser.save();
      console.log('It got here');
      const userDoc = await getPopulatedUserTreeDoc(testUser._id);
      // console.log(JSON.stringify(userDoc, null, 2));
      res.status(200).json(userDoc);
    } catch (err) {
      console.error(err);
      res.status(400).send(err);
    }
  });

  /**
   * Creates a new project for the given user ID. If successful, it returns
   * the newly created project.
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
