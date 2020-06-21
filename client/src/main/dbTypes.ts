/**
 * This file is meant to hold the different types associated with the database
 * for PointSpire.
 */

/**
 * The basic type for a document from MongoDB.
 */
interface Document extends IndexableProperties {
  _id: string;
  __v: number;
}

/**
 *
 */
interface IndexableProperties {
  [key: string]: unknown;
}

/* User Types */

export type UserSettings = {
  yellowGreenTasks: boolean;

  /**
   * This is defined so that extra settings can be added onto the settings
   * object.
   */
  [settingName: string]: boolean;
};

export interface User extends Document {
  projects: Array<string>;
  firstName: string;
  lastName: string;
  githubId: string;
  dateCreated: Date;
  userName: string;
  settings: UserSettings;
}

export type AllUserData = {
  user: User;
  projects: ProjectObjects;
  tasks: TaskObjects;
};

/* Project Types */

export type Project = Task;

export type ProjectObjects = {
  [id: string]: Project;
};

/* Task Types */

export interface Task extends Document {
  subtasks: Array<string>;
  dateCreated: Date;
  note: string;
  title: string;
}

export type TaskObjects = {
  [id: string]: Task;
};

export function tasksAreEqual(task1: Task, task2: Task): boolean {
  let equal = true;
  Object.keys(task1).forEach(key => {
    if (key !== '__v' && key !== 'subtasks') {
      if (task1[key] !== task2[key]) {
        equal = false;
      }
    }
  });
  return equal;
}
