import { Grid, IconButton } from '@material-ui/core';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import React from 'react';
import { Task, Project } from '../logic/dbTypes';

export type TaskExpanderButtonProps = {
  parent: Task | Project;
  setOpen: (open: boolean) => void;
  open: boolean;
};

function TaskExpanderButton(props: TaskExpanderButtonProps): JSX.Element {
  const { parent, setOpen, open } = props;
  return (
    <Grid item>
      <IconButton
        disabled={parent.subtasks.length === 0}
        aria-label="subtask-expander"
        onClick={() => {
          setOpen(!open);
        }}
      >
        {open ? <UpIcon /> : <DownIcon />}
      </IconButton>
    </Grid>
  );
}

export default TaskExpanderButton;
