import moment from 'moment';
import { CompletableType } from './dbTypes';
import User from '../models/User';
import Completables from '../models/Completables';

export default function isFiltered(
  completableType: CompletableType,
  completableId: string
) {
  const { filters } = User.get();
  const completable = Completables.get(completableType, completableId);

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
