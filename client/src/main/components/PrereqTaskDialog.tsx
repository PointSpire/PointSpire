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
  prereqTasks: string[];
  closeDialog: OpenPrereqTaskFunction;
  handlePrereqTaskChange: (taskId: string) => void;
}

const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const {
    tasks,
    openDialog,
    parentTask,
    prereqTasks,
    closeDialog,
    handlePrereqTaskChange,
  } = props;

  return (
    <Dialog open={openDialog} onClose={closeDialog}>
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <PrereqTaskManager
          parentTask={parentTask}
          prereqTasks={prereqTasks}
          allTasks={tasks}
          handlePrereqTaskChange={handlePrereqTaskChange}
        />
      </DialogContent>
      <DialogActions>
        <Button id="cancel-prereq-tasks" variant="text" onClick={closeDialog}>
          Cancel
        </Button>
        <Button id="save-prereq-tasks" variant="text" onClick={closeDialog}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrereqTaskDialog;
