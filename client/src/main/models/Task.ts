import { ObjectId } from 'bson';
import { Document } from '../utils/dbTypes';

/**
 * Represents a new task. This mirrors the database version of a task
 * completely.
 */
export default class Task implements Document {
  [key: string]: unknown;

  _id: string = new ObjectId().toHexString();

  __v?: number | undefined;

  subtasks: Array<string> = [];

  prereqTasks: Array<string> = [];

  dateCreated: Date = new Date();

  startDate: Date | null = null;

  dueDate: Date | null = null;

  note = '';

  title = '';

  priority = 0;

  completed = false;

  completedDate: Date | null = null;

  /**
   * Holds an array of tag IDs for the task that correspond to the user's tags.
   */
  tags: Array<string> = [];
}
