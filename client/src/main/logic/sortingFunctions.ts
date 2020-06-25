import moment from 'moment';
import { Task } from './dbTypes';

/**
 * Sorts tasks by priority where the first task has the lowest number prirotiy
 * and the last task has the highesst. This can be provided to the `sort`
 * function on arrays for either Tasks or Projects.
 *
 * @param {Task} task1 the first task
 * @param {Task} task2 the second task
 */
export function prioritySortDescending(task1: Task, task2: Task): number {
  return task1.priority - task2.priority;
}

/**
 * Sorts tasks by the dueDate.
 *
 * @param {Task} task1 the first task
 * @param {Task} task2 the second task
 */
export function dueDateSortDescending(task1: Task, task2: Task): number {
  return moment(task1.dueDate).diff(task2.dueDate);
}

/**
 * Sorts tasks by the startDate.
 *
 * @param {Task} task1 the first task
 * @param {Task} task2 the second task
 */
export function startDateSortDescending(task1: Task, task2: Task): number {
  return moment(task1.startDate).diff(task2.startDate);
}

export interface SortingFunctions {
  [key: string]: (task1: Task, task2: Task) => number;
}

const sortingFunctions: SortingFunctions = {
  Priority: prioritySortDescending,
  'Due Date': dueDateSortDescending,
  'Start Date': startDateSortDescending,
};

export default sortingFunctions;
