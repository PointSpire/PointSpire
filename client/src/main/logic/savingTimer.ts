/**
 * Provides the functions needed to run some set of API calls after a certain
 * amount of time has passed.
 */

import { AppSaveStatus, SavedStatus } from './ClientData/AppSaveStatus';

/**
 * The latest timer ID that was scheduled.
 */
let currentTimerId: NodeJS.Timeout;

/**
 * The time to wait after the latest scheduleCallback function is called before
 * all of the callbacks are initiated.
 */
const timeToWait = 10 * 1000;

/**
 * The store for the callbacks
 */
let callbacks: { [key: string]: Function } = {};

/**
 * Asks the user first before closing out of the application if there are still
 * changes to be saved.
 *
 * @param {BeforeUnloadEvent} e the event passed in from the window
 */
export function windowUnloadListener(e: BeforeUnloadEvent) {
  if (AppSaveStatus.getStatus() !== SavedStatus.Saved) {
    // Prevent unload
    e.preventDefault();
    e.returnValue = '';
  }
  // Allow unload
  delete e.returnValue;
}

/**
 * Runs all the callbacks stored and then clears the callbacks object.
 */
function runAllCallbacks() {
  AppSaveStatus.setStatus(SavedStatus.Saving);
  Object.values(callbacks).forEach(callback => {
    callback();
  });
  AppSaveStatus.setStatus(SavedStatus.Saved);
  callbacks = {};
}

/**
 * Resets the timer before the callbacks are ran. This is good to run after
 * a render occurs on components to make sure the callbacks don't run while
 * the user is interacting with the page.
 */
export function resetTimer(): void {
  clearTimeout(currentTimerId);
  currentTimerId = setTimeout(runAllCallbacks, timeToWait);
}

/**
 * Cancels the current timer to prevent double saving during a user initiated
 * save.
 */
export function cancelTimer(): void {
  clearTimeout(currentTimerId);
}

/**
 * Clears the current timer, runs all callback and resets the timer.
 * Used to manually save all changes, primarily used in the user save button.
 */
export function manualSave(): void {
  cancelTimer();
  runAllCallbacks();
  resetTimer();
}

/**
 * Schedules the given callback to be ran after a certain number of seconds
 * have passed since this function has been called globally. This is an ideal
 * place to schedule API saving calls.
 *
 * To just reset the timer, like in a `useEffect` or lifecycle function in a
 * component, you can simply use the `resetTimer` function in this file.
 *
 * @param {string} key the key of the callback. This is used to identify and
 * overwrite a certain callback if it is scheduled multiple times. That way
 * only the latest callback is ran after the specified amount of time. This
 * key should be unique in the application. For example
 * `${project._id}.methodName`.
 * @param {Function} callback the function to be ran after the specified
 * amount of time since the last time `scheduleCallback` was called globally
 */
export default function scheduleCallback(
  key: string,
  callback: Function
): void {
  AppSaveStatus.setStatus(SavedStatus.Save);
  callbacks[key] = callback;
  resetTimer();
}
