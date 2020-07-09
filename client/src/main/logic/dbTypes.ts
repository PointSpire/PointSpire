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
 * Can be used to make it so that an object is indexable.
 */
interface IndexableProperties {
  [key: string]: unknown;
}

/**
 * Represents a completable type that is either a Task or a Project.
 */
export type Completable = Task | Project;

export type CompletableType = 'project' | 'task';

/* User Types */

export type UserSettings = {
  yellowGreenTasks: boolean;
  notesExpanded: boolean;

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

/* Task Types */

export interface Task extends Document {
  subtasks: Array<string>;
  prereqTasks: Array<string>;
  dateCreated: Date;
  startDate: Date | null;
  dueDate: Date | null;
  note: string;
  title: string;
  priority: number;
  completed: boolean;
  completedDate: Date | null;
}

export type TaskObjects = {
  [id: string]: Task;
};

export function tasksAreEqual(task1: Task, task2: Task): boolean {
  let equal = true;
  // eslint-disable-next-line
  console.log(task1._id);
  Object.keys(task1).forEach(key => {
    if (
      key !== '__v' &&
      key !== 'subtasks' &&
      key !== 'startDate' &&
      key !== 'dueDate'
    ) {
      if (
        task1[key] &&
        JSON.stringify(task1[key]) !== JSON.stringify(task2[key])
      ) {
        equal = false;
        // eslint-disable-next-line
        console.log(`Unequal Task - ${key} - ${task1[key]} : ${task2[key]}`);
      }
    }
  });
  return equal;
}

/* Project Types */

export type Project = Task;

export type ProjectObjects = {
  [id: string]: Project;
};

export function projectsAreEqual(
  project1: Project,
  project2: Project
): boolean {
  return tasksAreEqual(project1, project2);
}
