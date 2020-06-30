import React, { MouseEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
} from '@material-ui/core';
import { Task, TaskObjects } from '../logic/dbTypes';
import PrereqTaskManager from './PrereqTaskManager';

export interface PrereqTaskDialogProps {
  tasks: TaskObjects;
  parentTask: Task;
  openDialog: boolean;
  // prereqTasks: string[];
  closeDialog: (
    e: React.MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
}

const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const { tasks, openDialog, parentTask, closeDialog } = props;

  return (
    <Dialog
      open={openDialog}
      onClose={(e: MouseEvent<HTMLElement>) => closeDialog(e, null)}
    >
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <PrereqTaskManager
          parentTask={parentTask}
          // prereqTasks={prereqTasks}
          allTasks={tasks}
          closeDialog={closeDialog}
        />
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default PrereqTaskDialog;
