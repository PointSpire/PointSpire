import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { DialogActions, Button } from '@material-ui/core';
import PriorityInput from './PriorityInput';

type PriorityDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  savePriority: (priority: number) => void;
  priority: number;
  projectOrTaskTitle: string;
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
  const { setOpen, open, savePriority, priority, projectOrTaskTitle } = props;

  /**
   * Handles the closing of the PriorityDialog
   */
  function handleClose(): void {
    setOpen(false);
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key === 'Enter') {
      handleClose();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      onKeyUp={handleKeyUp}
      aria-labelledby="priority-dialog-title"
    >
      <DialogTitle id="priority-dialog-title">
        {`Set priority for "${projectOrTaskTitle}"`}
      </DialogTitle>
      <DialogContent>
        <PriorityInput savePriority={savePriority} priority={priority} />
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
