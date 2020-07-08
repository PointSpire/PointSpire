import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';

export type SimpleTextInputProps = {
  saveValue: (value: string) => void;
  value: string;
  label: string;
  className?: string;
  disabled: boolean;
};

function SimpleTextInput(props: SimpleTextInputProps): JSX.Element {
  const { value: propValue, label, className, saveValue, disabled } = props;
  const [value, setValue] = useState(propValue);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    if (propValue !== value) {
      saveValue(value);
    }
  }

  return (
    <TextField
      className={className}
      disabled={disabled}
      size="small"
      fullWidth
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleLoseFocus}
    />
  );
}

export default SimpleTextInput;
