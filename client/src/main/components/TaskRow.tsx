import React from 'react';
import {
  TableCell,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  TableBody,
  Table,
  Box,
  TextField,
  Collapse,
  IconButton,
} from '@material-ui/core';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
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
   * The note for the task.
   */
  note: string;

  /**
   * Determines if the subtasks are open or not.
   */
  subTasksOpen: boolean;
};

class TaskRow extends React.Component<TaskRowProps, TaskRowState> {
  constructor(props: TaskRowProps) {
    super(props);

    const { task } = props;

    this.state = {
      title: task.title,
      note: task.note,
      subTasksOpen: false,
    };

    this.handleTaskInputChange = this.handleTaskInputChange.bind(this);
    this.handleLoseFocus = this.handleLoseFocus.bind(this);
    this.setSubTasksOpen = this.setSubTasksOpen.bind(this);
    this.generateSubTaskCollapse = this.generateSubTaskCollapse.bind(this);
    this.generateTaskExpanderButton = this.generateTaskExpanderButton.bind(
      this
    );
  }

  setSubTasksOpen(open: boolean) {
    this.setState({ subTasksOpen: open });
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

  handleTaskInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
    switch (event.target.id) {
      case 'title':
        this.setState({
          title: event.target.value,
        });
        break;
      case 'note':
        this.setState({
          note: event.target.value,
        });
        break;
      default:
        break;
    }
  }

  /**
   * Generates the task expander button only if this task has subtasks.
   */
  generateTaskExpanderButton(): JSX.Element | null {
    const { task } = this.props;
    const { subTasksOpen } = this.state;
    if (task.subtasks.length !== 0) {
      return (
        <TableCell>
          <IconButton
            aria-label="project-expander"
            onClick={() => {
              this.setSubTasksOpen(!subTasksOpen);
            }}
          >
            {subTasksOpen ? <UpIcon /> : <DownIcon />}
          </IconButton>
        </TableCell>
      );
    }
    return null;
  }

  /**
   * Generates the Collapse element only if this task has subtasks.
   */
  generateSubTaskCollapse(): JSX.Element | null {
    const { task, setTask, classes, tasks, addTaskToTask } = this.props;
    const { subTasksOpen } = this.state;
    if (task.subtasks.length !== 0) {
      return (
        <Collapse in={subTasksOpen} timeout="auto">
          {task.subtasks.map(taskId => (
            <TaskRow
              setTask={setTask}
              classes={classes}
              task={tasks[taskId]}
              tasks={tasks}
              addTaskToTask={addTaskToTask}
            />
          ))}
        </Collapse>
      );
    }
    return null;
  }

  render() {
    const { task } = this.props;
    const { title, note } = this.state;
    const {
      handleTaskInputChange,
      handleLoseFocus,
      generateSubTaskCollapse,
      generateTaskExpanderButton,
    } = this;
    return (
      <Box key={task._id}>
        <Table size="small">
          <TableBody>
            {generateTaskExpanderButton()}
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
          </TableBody>
        </Table>
        {generateSubTaskCollapse()}
      </Box>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TaskRow);
