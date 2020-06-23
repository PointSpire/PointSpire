import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';
import { Task } from '../logic/dbTypes';

export interface PrereqTaskDialogProps {
  parentTask: Task;
  openDialog: boolean;
}

const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const { openDialog, parentTask } = props;
  const { title } = parentTask;
  const [isOpen, setOpen] = useState<boolean>(openDialog);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {`Control what tasks are required to complete ${title}.`}
        </DialogContentText>
      </DialogContent>
    </Dialog>
  );
};

export default PrereqTaskDialog;
