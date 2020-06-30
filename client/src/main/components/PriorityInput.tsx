import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';

export type PriorityInputProps = {
  savePriority: (value: number) => void;
  priority: number;
};

function PriorityInput(props: PriorityInputProps): JSX.Element {
  const { priority: initialPriority, savePriority } = props;
  const [priority, setPriority] = useState(initialPriority);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    // Check to make sure they typed an int
    if (event.target.value.length === 0) {
      setPriority(0);
    } else if (!Number.isNaN(Number.parseInt(event.target.value, 10))) {
      setPriority(Number.parseInt(event.target.value, 10));
    }
    resetTimer();
  }

  function handleLoseFocus(): void {
    savePriority(priority);
  }

  return (
    <TextField
      label="Priority"
      value={priority}
      onChange={handleChange}
      onBlur={handleLoseFocus}
    />
  );
}

export default PriorityInput;
