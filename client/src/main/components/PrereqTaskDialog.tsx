import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from '@material-ui/core';
import { Task, TaskObjects } from '../logic/dbTypes';
import { OpenPrereqTaskFunction } from './TaskRow';
import PrereqTaskManager from './PrereqTaskManager';

export interface PrereqTaskDialogProps {
  tasks: TaskObjects;
  parentTask: Task;
  openDialog: boolean;
  closeDialog: OpenPrereqTaskFunction;
}

const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const { tasks, openDialog, closeDialog, parentTask } = props;

  return (
    <Dialog open={openDialog} onClose={closeDialog}>
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <PrereqTaskManager parentTask={parentTask} allTasks={tasks} />
      </DialogContent>
      <DialogActions>
        <Button id="save-prereq-tasks" variant="text" onClick={closeDialog}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrereqTaskDialog;
