/**
 * This file is used to specify the order in which the tests run. The order of
 * require statements below is the order in which they run. This is also used
 * to pass variables between the files and cleanup after the tests.
 *
 * We are looking to achieve the following logic:
 * 1. Connect to the database
 * 2. Test that a user can be created and pass that created user on to the
 * next tests.
 * 3. Run the rest of the tests with the connected app and testUser.
 * 4. Delete the test user from the DB.
 */

import app from '../../app';
import Globals from './globals';

/**
 * Waits for the server to be started before running tests
 */
before(done => {
  app.on('started', () => {
    Globals.app = app;
    done();
  });
});

describe('PointSpire tests', () => {
  require('./testStartup');
  require('./apiTest');
  require('./testCleanup');
});
