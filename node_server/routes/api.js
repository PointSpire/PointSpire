const express = require('express');
const router = new express.Router();

/**
 * @typedef {import('@types/express').Router} Router
 */

/**
 * Creates the express Router for the `/api` endpoint.
 *
 * @param {import('mongoose')} db the connected MongoDB database
 * @returns {Router} the Router for the `/api` endpoint
 */
function createApiRouter(db) {
  router.get('/', (req, res, next) => {
    res.send('Please use an endpoint');
  });

  // tasks endpoint for all the tasks in the database
  router.get('/tasks', (req, res, next) => {

  });
  return router;
}

module.exports = createApiRouter;
