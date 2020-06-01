import { Express } from 'express';
import { UserDoc } from '../main/models/user';
import { TaskDoc } from '../main/models/task';

/**
 * Holds the global variables for the tests.
 */
export default class Globals {
  public static app: Express;
  public static testUser: UserDoc;
  public static testTask: TaskDoc;
}
