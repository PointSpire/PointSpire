import moment from 'moment';
import { CompletableType } from './dbTypes';
import ClientData from './ClientData';

function getCompletables(type: CompletableType) {
  if (type === 'project') {
    return ClientData.getProjects();
  }
  return ClientData.getTasks();
}

/**
 * Generates a sorting function that can be used to sort completables by
 * priority.
 *
 * @param {CompletableType} type the type of the completables
 */
export function prioritySortDescending(type: CompletableType) {
  const completables = getCompletables(type);
  return (completable1Id: string, completable2Id: string): number => {
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

export type SortingFunctions = {
  [title: string]: (
    type: CompletableType
  ) => (completable1Id: string, completable2Id: string) => number;
};

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
