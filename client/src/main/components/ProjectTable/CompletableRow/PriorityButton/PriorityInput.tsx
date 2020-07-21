import React from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../../../../utils/savingTimer';

export type PriorityInputProps = {
  input: string;
  setInput: (input: string) => void;
  validateInput: (input: string) => void;
  error: boolean;
  helperText: string;
};

/**
 * Represents the textual input for a priority. This handles validation on the
 * input.
 *
 * @param {PriorityInputProps} props the props
 */
function PriorityInput(props: PriorityInputProps): JSX.Element {
  const { setInput, input, error, helperText, validateInput } = props;

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value);
    validateInput(event.target.value);
    resetTimer();
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
    />
  );
}

export default PriorityInput;
