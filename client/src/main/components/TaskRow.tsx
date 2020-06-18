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
  TableHead,
  TableBody,
  Table,
  Box,
  TextField,
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
  handleChange: (taskId: string, inputId: string, value: string) => void;
}

function TaskRow(props: TaskRowProps) {
  const { classes, task, tasks, handleChange } = props;
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
          <TableCell>
            <TextField
              id="title-input"
              label="Title"
              value={task.title}
              variant="outlined"
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  /* eslint-disable-next-line no-underscore-dangle */
                  handleChange(task._id, e.target.id, e.target.value)
                /* eslint-disable-next-line */
              }
            />
          </TableCell>
          <TableCell>
            <TextField
              id="note-input"
              label="Notes"
              value={task.note}
              multiline
              variant="outlined"
              onChange={
                (e: React.ChangeEvent<HTMLInputElement>) =>
                  /* eslint-disable-next-line no-underscore-dangle */
                  handleChange(task._id, e.target.id, e.target.value)
                /* eslint-disable-next-line */
              }
            />
          </TableCell>
          {task.subtasks.map(subtask => (
            <TaskRow
              classes={classes}
              task={tasks[subtask]}
              tasks={tasks}
              handleChange={handleChange}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

export default withStyles(styles, { withTheme: true })(TaskRow);
