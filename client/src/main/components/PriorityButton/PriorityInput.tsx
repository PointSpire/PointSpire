import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../../logic/savingTimer';

export type PriorityInputProps = {
  savePriority: (value: number) => void;
  priority: number;
};

/**
 * Represents the textual input for a priority. This handles validation on the
 * input.
 *
 * @param {PriorityInputProps} props the props
 */
function PriorityInput(props: PriorityInputProps): JSX.Element {
  const { priority: initialPriority, savePriority } = props;
  let priority: string;
  if (!initialPriority) {
    priority = '0';
  } else {
    priority = initialPriority.toString();
  }
  const [input, setInput] = useState<string>(priority);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  function validateInput(value: string): void {
    if (value.length === 0) {
      setError(true);
      setHelperText('Please enter a priority number');
    } else if (!Number.isNaN(Number.parseInt(value, 10))) {
      setError(false);
      setHelperText('');
    } else {
      setError(true);
      setHelperText('Please enter a non-decimal integer');
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value);
    validateInput(event.target.value);
    resetTimer();
  }

  function saveIfNoError(): void {
    if (!error) {
      savePriority(Number.parseInt(input, 10));
    }
  }

  function handleLoseFocus(): void {
    saveIfNoError();
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter') {
      saveIfNoError();
    }
  }

  return (
    <TextField
      autoFocus
      size="small"
      label="Priority"
      error={error}
      helperText={helperText}
      value={input}
      onChange={handleChange}
      onBlur={handleLoseFocus}
      onKeyUp={handleKeyUp}
    />
  );
}

export default PriorityInput;
