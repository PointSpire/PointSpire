import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from '@material-ui/core';
import { Task, TaskObjects } from '../logic/dbTypes';
import PrereqTaskManager from './PrereqTaskManager';
import {
  OpenPrereqTaskFunction,
  HandlePrereqTaskChangeFunction,
  HandleSearchClickFunction,
  HandleSearchClearFunction,
} from './TaskRow';

export interface PrereqTaskDialogProps {
  tasks: TaskObjects;
  parentTask: Task;
  openDialog: boolean;
  prereqTasks: string[];
  searchTaskResults: string[];
  isSearch: boolean;
  closeDialog: OpenPrereqTaskFunction;
  handleSearchClick: HandleSearchClickFunction;
  handlePrereqTaskChange: HandlePrereqTaskChangeFunction;
  handleSearchClear: HandleSearchClearFunction;
}

const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const {
    tasks,
    openDialog,
    parentTask,
    prereqTasks,
    searchTaskResults,
    isSearch,
    closeDialog,
    handleSearchClick,
    handlePrereqTaskChange,
    handleSearchClear,
  } = props;

  return (
    <Dialog open={openDialog} onClose={closeDialog}>
      <DialogTitle>Prerequisite Tasks Menu</DialogTitle>
      <DialogContent>
        <PrereqTaskManager
          parentTask={parentTask}
          prereqTasks={prereqTasks}
          allTasks={tasks}
          searchTaskResults={searchTaskResults}
          isSearch={isSearch}
          handleSearchClick={handleSearchClick}
          handlePrereqTaskChange={handlePrereqTaskChange}
          handleSearchClear={handleSearchClear}
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
