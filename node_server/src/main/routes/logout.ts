import express, { Router } from 'express';

const router = express.Router();

/**
 * Creates the express Router for the `/logout` endpoint.
 *
 * @returns {Router} the Router for the `/logout` endpoint
 */
export default function createLogoutRouter(): Router {
  /**
   * Logs out the user by destroying the session object.
   */
  router.use('/', (req, res, next) => {
    if (req.session) {
      req.session.destroy(err => {
        if (err) {
          next(err);
        } else {
          res.status(200).send('Success');
        }
      });
    } else {
      next();
    }
  });
  return router;
}
