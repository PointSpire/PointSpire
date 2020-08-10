import Completable from './Completable';

export type TaskObjects = {
  [id: string]: Task;
};

export function tasksAreEqual(task1: Task, task2: Task): boolean {
  let equal = true;
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

/**
 * Represents a new task. This mirrors the database version of a task
 * completely.
 */
export default class Task extends Completable {}
