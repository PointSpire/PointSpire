/**
 * Provides the functions needed to run some set of API calls after a certain
 * amount of time has passed.
 */

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
 * Runs all the callbacks stored and then clears the callbacks object.
 */
function runAllCallbacks() {
  Object.values(callbacks).forEach(callback => {
    callback();
  });
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
 * key should be unique in the application.
 * @param {Function} callback the function to be ran after the specified
 * amount of time since the last time `scheduleCallback` was called globally
 */
export default function scheduleCallback(
  key: string,
  callback: Function
): void {
  callbacks[key] = callback;
  resetTimer();
}
