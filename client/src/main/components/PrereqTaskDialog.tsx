import React, { MouseEvent } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
  // Button,
} from '@material-ui/core';
import { Task, TaskObjects, ProjectObjects } from '../logic/dbTypes';
import PrereqTaskManager from './PrereqTaskManager';

function styles(theme: Theme) {
  return createStyles({
    root: {
      background: theme.palette.background.default,
    },
    title: {
      background: theme.palette.primary.main,
    },
    content: {
      background: theme.palette.background.default,
    },
  });
}

export interface PrereqTaskDialogProps extends WithStyles<typeof styles> {
  savePrereqId: string;
  projects: ProjectObjects;
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
  const {
    classes,
    projects,
    tasks,
    openDialog,
    parentTask,
    savePrereqId,
    closeDialog,
  } = props;

  return (
    <Dialog
      maxWidth="lg"
      open={openDialog}
      onClose={(e: MouseEvent<HTMLElement>) => closeDialog(e, null)}
    >
      <DialogTitle className={classes.title}>
        Prerequisite Tasks Menu
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography align="center">{parentTask.title}</Typography>
        <PrereqTaskManager
          allProjects={projects}
          savePrereqId={savePrereqId}
          parentTask={parentTask}
          allTasks={tasks}
          closeDialog={closeDialog}
        />
      </DialogContent>
      <DialogActions />
      {/* <Button variant="text" onClick={() => close()}>Cancel</Button>
        <Button>Save</Button>
      </DialogActions> */}
    </Dialog>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskDialog);
