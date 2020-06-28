import React, { useState } from 'react';
import {
  Button,
  WithStyles,
  createStyles,
  withStyles,
  InputLabel,
} from '@material-ui/core';
import PriorityDialog from './PriorityDialog';

function styles() {
  return createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
  });
}

export interface PriorityButtonProps extends WithStyles<typeof styles> {
  savePriority: (priority: number) => void;
  priority: number;
  projectOrTaskTitle: string;
}

function PriorityButton(props: PriorityButtonProps): JSX.Element {
  const { savePriority, priority, projectOrTaskTitle, classes } = props;
  const [open, setOpen] = useState(false);

  function handleClick(): void {
    setOpen(true);
  }

  return (
    <div className={classes.root}>
      <InputLabel shrink>Priority</InputLabel>
      <Button variant="outlined" onClick={handleClick}>
        {priority}
      </Button>
      <PriorityDialog
        open={open}
        setOpen={setOpen}
        savePriority={savePriority}
        priority={priority}
        projectOrTaskTitle={projectOrTaskTitle}
      />
    </div>
  );
}

export default withStyles(styles, { withTheme: false })(PriorityButton);
