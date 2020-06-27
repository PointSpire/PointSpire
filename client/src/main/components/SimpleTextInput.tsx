import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';

export type SimpleTextInputProps = {
  saveValue: (value: string) => void;
  value: string;
  label: string;
};

function SimpleTextInput(props: SimpleTextInputProps): JSX.Element {
  const { value: initialValue, label } = props;
  const [value, setValue] = useState(initialValue);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    props.saveValue(value);
  }

  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleLoseFocus}
    />
  );
}

export default SimpleTextInput;
