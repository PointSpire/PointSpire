import React from 'react';
import {
  TableRow,
  TableCell,
  // Typography,
  // Paper,
  // IconButton,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  // Collapse,
  TableHead,
  TableBody,
  Table,
  Box,
} from '@material-ui/core';
import { Task, TaskObjects } from '../dbTypes';

function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  });
}

export interface TaskRowProps extends WithStyles<typeof styles> {
  task: Task;
  tasks: TaskObjects;
}

function TaskRow(props: TaskRowProps) {
  const { classes, task, tasks } = props;
  return (
    <Box>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Note</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableCell>{task.title}</TableCell>
          <TableCell>{task.note}</TableCell>
          {task.subtasks.map(subtask => (
            <TaskRow classes={classes} task={tasks[subtask]} tasks={tasks} />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default withStyles(styles, { withTheme: true })(TaskRow);
