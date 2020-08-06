import moment from 'moment';
import Debug from 'debug';
import { CompletableType } from './dbTypes';
import UserData from '../clientData/UserData';

const debug = Debug('sortingFunctions.ts');
debug.enabled = false;

function getCompletables(type: CompletableType) {
  if (type === 'project') {
    return UserData.getProjects();
  }
  return UserData.getTasks();
}

/**
 * Generates a sorting function that can be used to sort completables by
 * priority.
 *
 * @param {CompletableType} type the type of the completables
 */
export function prioritySortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  debug(`prioritySortDescending completables is: `, completables);
  return (completable1Id: string, completable2Id: string): number => {
    if (!completables[completable1Id]) {
      debug(`Completable with ID: ${completable1Id} came back undefined`);
    }
    return (
      completables[completable1Id].priority -
      completables[completable2Id].priority
    );
  };
}

/**
 * Generates a sorting function that can be used to sort completables by
 * dueDate.
 *
 * @param {CompletableType} type the type of the completables
 */
export function dueDateSortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  return (completable1Id: string, completable2Id: string): number => {
    const completable1 = completables[completable1Id];
    const completable2 = completables[completable2Id];
    return moment(completable1.dueDate).diff(completable2.dueDate);
  };
}

/**
 * Generates a sorting function that can be used to sort completables by
 * startDate.
 *
 * @param {CompletableType} type the type of the completables
 */
export function startDateSortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  return (completable1Id: string, completable2Id: string): number => {
    const completable1 = completables[completable1Id];
    const completable2 = completables[completable2Id];
    return moment(completable1.startDate).diff(completable2.startDate);
  };
}

/**
 * Generates a sorting function that can be used to sort completables by
 * title.
 *
 * @param {CompletableType} type the type of the completables
 */
export function titleSortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  return (completable1Id: string, completable2Id: string): number => {
    const completable1 = completables[completable1Id];
    const completable2 = completables[completable2Id];
    return completable1.title.localeCompare(completable2.title);
  };
}

/**
 * Sorts completables by the number of prerequisite tasks.
 *
 * @param {CompletableType} type the type of the completables
 */
export function prereqSortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  return (completableId1: string, completableId2: string): number => {
    const completable1 = completables[completableId1];
    const completable2 = completables[completableId2];
    return completable2.prereqTasks.length - completable1.prereqTasks.length;
  };
}

/**
 * Sorting functions that can be used to sort completables. Includes the
 * correct label name and the key is the completable property name.
 */
export type SortingFunctions = {
  [propertyName: string]: {
    labelName: string;
    function: (
      type: CompletableType
    ) => (completable1Id: string, completable2Id: string) => number;
  };
};

/**
 * Used to specify the different sorting options for the user. The key is the
 * property name on the completable.
 */
const sortingFunctions: SortingFunctions = {
  priority: {
    labelName: 'Priority',
    function: prioritySortDescending,
  },
  dueDate: {
    labelName: 'Due Date',
    function: dueDateSortDescending,
  },
  startDate: {
    labelName: 'Start Date',
    function: startDateSortDescending,
  },
  title: {
    labelName: 'Title',
    function: titleSortDescending,
  },
  prereqs: {
    labelName: 'prerequisites',
    function: prereqSortDescending,
  },
};

export default sortingFunctions;
