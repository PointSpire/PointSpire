import { Task } from './dbTypes';

/**
 * Sorts tasks by priority where the first task has the lowest number prirotiy
 * and the last task has the highesst. This can be provided to the `sort`
 * function on arrays for either Tasks or Projects.
 *
 * @param {Task} task1 the first task
 * @param {Task} task2 the second task
 */
export default function prioritySortDescending(
  task1: Task,
  task2: Task
): number {
  return task1.priority - task2.priority;
}
