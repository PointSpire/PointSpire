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

export function searchByNameDescending(
  searchTerm: string,
  tasks: Task[]
): string[] {
  const matches = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return matches.map(task => task._id);
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

/**
 * Sorts tasks by the title.
 *
 * @param {Task} task1 the first task
 * @param {Task} task2 the second task
 */
export function titleSortDescending(task1: Task, task2: Task): number {
  return task1.title.localeCompare(task2.title);
}

export interface SortingFunctions {
  [key: string]: (task1: Task, task2: Task) => number;
}

/**
 * Used to specify the different sorting options for the user. The key is
 * user-facing.
 */
const sortingFunctions: SortingFunctions = {
  Priority: prioritySortDescending,
  'Due Date': dueDateSortDescending,
  'Start Date': startDateSortDescending,
  Title: titleSortDescending,
};

export default sortingFunctions;
