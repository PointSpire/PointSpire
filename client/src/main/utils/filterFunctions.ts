import moment from 'moment';
import { CompletableType } from './dbTypes';
import UserData from '../clientData/UserData';

export default function isFiltered(
  completableType: CompletableType,
  completableId: string
) {
  const { filters } = UserData.getUser();
  const completable = UserData.getCompletable(completableType, completableId);

  if (!filters.showCompletedTasks && completable.completed) {
    return true;
  }
  if (
    !filters.showFutureStartDates &&
    moment(completable.startDate).isAfter(moment.now())
  ) {
    return true;
  }

  /* Check if any tag in the tagIdsToShow is in the completable's tags. If it
  is, then it should not enter the if condition. */
  if (
    filters.tagIdsToShow.length !== 0 &&
    !filters.tagIdsToShow.some(tagId => completable.tags.includes(tagId))
  ) {
    return true;
  }
  return false;
}
