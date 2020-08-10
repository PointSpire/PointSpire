/**
 * Provides the functions needed to run some set of API calls after a certain
 * amount of time has passed.
 */

import Debug from 'debug';
import { AppSaveStatus, SavedStatus } from '../models/AppSaveStatus';

const debug = Debug('savingTimer.ts');
debug.enabled = false;

/**
 * The time to wait after the latest scheduleCallback function is called before
 * all of the callbacks are initiated.
 */
const timeToWait = 10 * 1000;

class TimerData {
  /**
   * The store for the callbacks
   */
  static callbacks: {
    [key: string]: () => Promise<void>;
  } = {};

  /**
   * The latest timer ID that was scheduled.
   */
  static currentTimerId: NodeJS.Timeout;

  /**
   * Contiains the ordered keys of the callbacks to run. This is separate from
   * `callbacks` to save on processing time because each time a callback is
   * added a check needs to run that will see if the callback has alredy been
   * added. This way no checks need to run until saving occurs.
   */
  static orderedCallbacks: Array<string> = [];
}

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

async function runCallbackPromises() {
  // eslint-disable-next-line
  for (const key of TimerData.orderedCallbacks) {
    // eslint-disable-next-line no-await-in-loop
    await TimerData.callbacks[key]();
  }
}

/**
 * Runs all the callbacks stored and then clears the callbacks object.
 */
function runAllCallbacks() {
  AppSaveStatus.setStatus(SavedStatus.Saving);

  debug('Ordered callbacks: ', TimerData.orderedCallbacks);

  runCallbackPromises().then(() => {
    AppSaveStatus.setStatus(SavedStatus.Saved);
    TimerData.callbacks = {};
    TimerData.orderedCallbacks = [];
  });
}

/**
 * Resets the timer before the callbacks are ran. This is good to run after
 * a render occurs on components to make sure the callbacks don't run while
 * the user is interacting with the page.
 */
export function resetTimer(): void {
  clearTimeout(TimerData.currentTimerId);
  TimerData.currentTimerId = setTimeout(runAllCallbacks, timeToWait);
}

/**
 * Cancels the current timer to prevent double saving during a user initiated
 * save.
 */
export function cancelTimer(): void {
  clearTimeout(TimerData.currentTimerId);
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
 * @param {Promise<void>} callback the function to be ran after the specified
 * amount of time since the last time `scheduleCallback` was called globally
 */
export default function scheduleCallback(
  key: string,
  callback: () => Promise<void>
): void {
  AppSaveStatus.setStatus(SavedStatus.Save);

  // Check to see if the callback is already there
  if (TimerData.callbacks[key]) {
    const index = TimerData.orderedCallbacks.indexOf(key);
    TimerData.orderedCallbacks.splice(index, 1);
  }
  TimerData.callbacks[key] = callback;
  TimerData.orderedCallbacks.push(key);
}
