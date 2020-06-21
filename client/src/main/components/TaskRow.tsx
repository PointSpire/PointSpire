import React from 'react';
import {
  TableRow,
  TableCell,
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
import { AddTaskToTask } from './ProjectTable';
import { SetTaskFunction } from '../App';

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
  addTaskToTask: AddTaskToTask;
  setTask: SetTaskFunction;
}

/**
 * Some of the details of the task are held in state to make it more efficient.
 * Then when the focus is left from a field in the row, then the current state
 * is saved to the task.
 */
type TaskRowState = {
  /**
   * The title for the task.
   */
  title: string;

  /**
   * The note for the task
   */
  note: string;

  /**
   * Used so that you can programatically change the state based on the id of
   * the element being changed.
   */
  [taskProperty: string]: string;
};

class TaskRow extends React.Component<TaskRowProps, TaskRowState> {
  constructor(props: TaskRowProps) {
    super(props);

    const { task } = props;

    this.state = {
      title: task.title,
      note: task.note,
    };

    this.handleTaskInputChange = this.handleTaskInputChange.bind(this);
    this.handleLoseFocus = this.handleLoseFocus.bind(this);
  }

  handleTaskInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      [event.target.id]: event.target.value,
    });
  }

  /**
   * Handles losing focus on an input element. This will save the task to the
   * applications state.
   */
  handleLoseFocus(): void {
    const { setTask, task } = this.props;
    const { title, note } = this.state;
    task.title = title;
    task.note = note;
    setTask(task);
  }

  render() {
    const { classes, task, tasks, addTaskToTask, setTask } = this.props;
    const { title, note } = this.state;
    const { handleTaskInputChange, handleLoseFocus } = this;
    return (
      <Box key={task._id}>
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
                key={task._id}
                id="title"
                label="Title"
                value={title}
                variant="outlined"
                onChange={handleTaskInputChange}
                onBlur={handleLoseFocus}
              />
            </TableCell>
            <TableCell>
              <TextField
                id="note"
                label="Notes"
                value={note}
                multiline
                variant="outlined"
                onChange={handleTaskInputChange}
                onBlur={handleLoseFocus}
              />
            </TableCell>
            {task.subtasks.map(subtask => (
              <TaskRow
                setTask={setTask}
                classes={classes}
                task={tasks[subtask]}
                tasks={tasks}
                addTaskToTask={addTaskToTask}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TaskRow);
