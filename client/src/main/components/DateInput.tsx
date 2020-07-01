import React, { useState } from 'react';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { DatePicker } from '@material-ui/pickers';

export type DateInputProps = {
  saveDate: (date: Date | null) => void;
  date: Date | null;
  label: string;
};

/**
 * The generalized component for a date input.
 *
 * @param {DateInputProps} props the props
 */
function DateInput(props: DateInputProps): JSX.Element {
  const { date: propDate, saveDate, label } = props;
  const [date, setDate] = useState<Date | null>(propDate);

  function handleAccept(newDate: MaterialUiPickersDate): void {
    if (newDate) {
      saveDate(newDate.toDate());
    } else {
      saveDate(null);
    }
  }

  function handleChange(newDate: MaterialUiPickersDate): void {
    if (newDate) {
      setDate(newDate.toDate());
    } else {
      setDate(null);
    }
  }

  return (
    <DatePicker
      size="small"
      variant="dialog"
      label={label}
      value={date}
      onAccept={handleAccept}
      clearable
      onChange={handleChange}
    />
  );
}

export default DateInput;
