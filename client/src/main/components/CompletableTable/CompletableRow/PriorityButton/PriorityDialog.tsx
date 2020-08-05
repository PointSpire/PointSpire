import React, { useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogActions, Button } from '@material-ui/core';
import PriorityInput from './PriorityInput';
import { CompletableType } from '../../../../utils/dbTypes';
import Completables from '../../../../models/Completables';

type PriorityDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  completableId: string;
  completableType: CompletableType;
};

/**
 * Represents the a dialog that can be used to set the priority on a project
 * or task.
 *
 * @param {PriorityDialogProps} props props passed to the PriorityDialog
 */
export default function PriorityDialog(
  props: PriorityDialogProps
): JSX.Element {
  const { setOpen, open, completableId, completableType } = props;

  const initialPriority = Completables.get(completableType, completableId)
    .priority;
  let priority: string;
  if (!initialPriority) {
    priority = '0';
  } else {
    priority = initialPriority.toString();
  }
  const [input, setInput] = useState<string>(priority);
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  /**
   * Handles the closing of the PriorityDialog
   */
  function handleClose(): void {
    setOpen(false);
  }

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

  function savePriority(): void {
    Completables.setAndSaveProperty(
      completableType,
      completableId,
      'priority',
      Number.parseInt(input, 10)
    );
  }

  function saveIfNoError(): void {
    if (!error) {
      savePriority();
    }
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter') {
      saveIfNoError();
      handleClose();
    }
  }

  const completableTitle = Completables.get(completableType, completableId)
    .title;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyUp={handleKeyUp}
      aria-labelledby="priority-dialog-title"
    >
      <DialogTitle id="priority-dialog-title">
        {`Set priority for "${completableTitle}"`}
      </DialogTitle>
      <DialogContent>
        <PriorityInput
          input={input}
          helperText={helperText}
          setInput={setInput}
          validateInput={validateInput}
          error={error}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            handleClose();
          }}
        >
          Save (Enter)
        </Button>
      </DialogActions>
    </Dialog>
  );
}
