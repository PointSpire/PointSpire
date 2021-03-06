import React, { useState, useEffect } from 'react';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DatePicker } from '@material-ui/pickers';
import { CompletableType } from '../../../utils/dbTypes';
import Completables from '../../../models/Completables';

export type DateInputProps = {
  completableType: CompletableType;
  completableId: string;
  label: string;
  completablePropertyName: 'startDate' | 'dueDate';
};

/**
 * The generalized component for a date input.
 *
 * @param {DateInputProps} props the props
 */
function DateInput(props: DateInputProps): JSX.Element {
  const {
    label,
    completableType,
    completableId,
    completablePropertyName,
  } = props;
  const [date, setDate] = useState<Date | null>(
    Completables.get(completableType, completableId)[completablePropertyName]
  );
  const [disabled, setDisabled] = useState(
    Completables.get(completableType, completableId).completed
  );

  /**
   * The ID for this listener when set on some property or completable.
   */
  const listenerId = `${completableId}.DateInput.${completablePropertyName}`;

  /**
   * Add the property listener for the completed value so that it disables
   * the date input when the completable is completed.
   */
  useEffect(() => {
    Completables.addPropertyListener(
      completableType,
      completableId,
      listenerId,
      'completed',
      updatedValue => {
        setDisabled(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      Completables.removePropertyListener(
        completableType,
        completableId,
        listenerId,
        'completed'
      );
    };
  }, []);

  /**
   * Add the property listener for the date. This could be skipped likely and
   * just set manually when the date is changed. But this allows for the date
   * to be changed by other components as well.
   */
  useEffect(() => {
    Completables.addPropertyListener(
      completableType,
      completableId,
      listenerId,
      completablePropertyName,
      updatedValue => {
        if (updatedValue !== date) {
          setDate(updatedValue as Date | null);
        }
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      Completables.removePropertyListener(
        completableType,
        completableId,
        listenerId,
        completablePropertyName
      );
    };
  }, []);

  function handleChange(newDate: MaterialUiPickersDate): void {
    if (newDate) {
      Completables.setAndSaveProperty(
        completableType,
        completableId,
        completablePropertyName,
        newDate.toDate()
      );
    } else {
      Completables.setAndSaveProperty(
        completableType,
        completableId,
        completablePropertyName,
        null
      );
    }
  }

  return (
    <DatePicker
      disabled={disabled}
      size="small"
      variant="dialog"
      label={label}
      value={date}
      clearable
      onChange={handleChange}
      fullWidth
    />
  );
}

export default DateInput;
