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
 * Schedules the given callback to be ran after a certain number of seconds
 * have passed since this function has been called globally. This is an ideal
 * place to schedule API saving calls.
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
  // eslint-disable-next-line
  console.log('Triggered scheduleCallback');
  callbacks[key] = callback;
  clearTimeout(currentTimerId);
  currentTimerId = setTimeout(runAllCallbacks, timeToWait);
}
