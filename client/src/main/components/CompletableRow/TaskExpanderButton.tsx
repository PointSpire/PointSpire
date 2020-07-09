import { Grid, IconButton } from '@material-ui/core';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import Tooltip from '@material-ui/core/Tooltip';
import React from 'react';
import { Task, Project } from '../../logic/dbTypes';

export type TaskExpanderButtonProps = {
  parent: Task | Project;
  setOpen: (open: boolean) => void;
  open: boolean;
};

function TaskExpanderButton(props: TaskExpanderButtonProps): JSX.Element {
  const { parent, setOpen, open } = props;
  return (
    <Grid item>
      <Tooltip title={open ? 'Show Less' : 'Show More'}>
        <span>
          <IconButton
            disabled={parent.subtasks.length === 0}
            aria-label="subtask-expander"
            onClick={() => {
              setOpen(!open);
            }}
          >
            {open ? <ExpandMoreIcon /> : <ChevronRightIcon />}
          </IconButton>
        </span>
      </Tooltip>
    </Grid>
  );
}

export default TaskExpanderButton;
