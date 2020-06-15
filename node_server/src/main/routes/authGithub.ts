import express, { Router } from 'express';
import fetch from 'node-fetch';
import {
  createUserObjectGithub,
  saveOrFindNewGithubUser,
} from '../../lib/userLib';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * Creates the express Router for the `/auth/github` endpoint.
 *
 * @param {typeof mongoose} db the connected mongoDB instance
 * @returns {Router} the Router for the `/auth/github` endpoint
 */
function authGithubRouter(db: typeof mongoose): Router {
  router.options('/', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    next();
  });

  router.post('/', async (req, res) => {
    try {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      if (req.body && req.body.code) {
        const githubReqBody = {
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_id: process.env.GITHUB_CLIENT_ID,
          // eslint-disable-next-line @typescript-eslint/camelcase
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: req.body.code,
        };
        const githubRes = await fetch(
          `https://github.com/login/oauth/access_token`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
            },
            body: JSON.stringify(githubReqBody),
          }
        );
        const githubToken = (await githubRes.json()).access_token;
        const profileRes = await fetch(`https://api.github.com/user`, {
          method: 'GET',
          headers: {
            Authorization: `token ${githubToken}`,
          },
        });
        const githubProfile = await profileRes.json();
        const newUser = createUserObjectGithub(db, githubProfile);
        const userDoc = await saveOrFindNewGithubUser(db, newUser);
        if (req.session) {
          req.session.userId = userDoc._id;
        }
        console.log('Retrieved user: ', JSON.stringify(userDoc, null, 2));
        res.status(200);
        res.json(userDoc);
      } else {
        res.json({ error: 'Must include req.body.code' });
      }
    } catch (err) {
      res.status(400);
      res.send(err);
    }
  });

  return router;
}

export default authGithubRouter;
