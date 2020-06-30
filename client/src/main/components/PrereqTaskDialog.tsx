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
  savePrereqId: string;
  tasks: TaskObjects;
  parentTask: Task;
  openDialog: boolean;
  closeDialog: (
    e: React.MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
}

/**
 * Handles opening the prerequisite tasks in a dialog box.
 * @param {PrereqTaskDialogProps} props PrereqTaskDialog properties.
 */
const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const { tasks, openDialog, parentTask, savePrereqId, closeDialog } = props;

  return (
    <Dialog
      open={openDialog}
      onClose={(e: MouseEvent<HTMLElement>) => closeDialog(e, null)}
    >
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <PrereqTaskManager
          savePrereqId={savePrereqId}
          parentTask={parentTask}
          allTasks={tasks}
          closeDialog={closeDialog}
        />
      </DialogContent>
      <DialogActions />
    </Dialog>
  );
};

export default PrereqTaskDialog;
