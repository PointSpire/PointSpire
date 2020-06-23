import React from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  ListItem,
  List,
  TextField,
  Collapse,
  IconButton,
  Grid,
} from '@material-ui/core';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import { DatePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Task, TaskObjects } from '../logic/dbTypes';
import { SetTaskFunction, SetTasksFunction } from '../App';
import {
  patchTask,
  deleteTask as deleteTaskOnServer,
  postNewTask,
} from '../logic/fetchMethods';
import TaskMenu from './TaskMenu';
import { DeleteSubTaskFunction } from './ProjectRow';
import PrereqTaskDialog from './PrereqTaskDialog';

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
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  deleteSubTask: DeleteSubTaskFunction;
}

/**
 * Saves the task to the server and logs to the console what happened.
 *
 * @param {Task} task the updated Task
 */
function saveTask(task: Task): void {
  patchTask(task)
    .then(result => {
      if (result) {
        // eslint-disable-next-line
        console.log('Task was successfully saved to the server');
      } else {
        // eslint-disable-next-line
        console.log('Task was not saved to the server. There was an error.');
      }
    })
    .catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
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

  priority: number;

  openPrereqTasks: boolean;
};

class TaskRow extends React.Component<TaskRowProps, TaskRowState> {
  constructor(props: TaskRowProps) {
    super(props);

    const { task } = props;

    this.state = {
      title: task.title,
      note: task.note,
      subTasksOpen: false,
      priority: task.priority,
      openPrereqTasks: false,
    };

    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleLoseFocus = this.handleLoseFocus.bind(this);
    this.setSubTasksOpen = this.setSubTasksOpen.bind(this);
    this.generateSubTaskCollapse = this.generateSubTaskCollapse.bind(this);
    this.generateTaskExpanderButton = this.generateTaskExpanderButton.bind(
      this
    );
    this.deleteTask = this.deleteTask.bind(this);
    this.deleteSubTask = this.deleteSubTask.bind(this);
    this.addSubTask = this.addSubTask.bind(this);
    this.handleDueDateChange = this.handleDueDateChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handlePriorityChange = this.handlePriorityChange.bind(this);
    this.handleOpenPrereqTaskDialog = this.handleOpenPrereqTaskDialog.bind(
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
    const { title, note, priority } = this.state;
    task.title = title;
    task.note = note;
    task.priority = priority;
    setTask(task);
    saveTask(task);
  }

  handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      title: event.target.value,
    });
  }

  handleNoteChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      note: event.target.value,
    });
  }

  /**
   * Adds a new sub task to this task on the server and in state. This also
   * opens the subtasks if they weren't already.
   *
   * @param {string} title the title of the new task
   */
  async addSubTask(title: string): Promise<void> {
    const { setTasks, tasks, task, setTask } = this.props;

    // Make the request for the new task
    const newTask = await postNewTask('task', task._id, title);

    // Add the new task to the task objects
    tasks[newTask._id] = newTask;
    setTasks(tasks);

    // Add the new task to the project
    task.subtasks.push(newTask._id);
    setTask(task);

    this.setSubTasksOpen(true);
  }

  /**
   * Deletes this task.
   */
  deleteTask() {
    const { task, deleteSubTask } = this.props;
    deleteSubTask(task).catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
  }

  /**
   * Deletes the given task from state and from the server.
   *
   * @param {Task} task the task to delete
   */
  async deleteSubTask(taskToDelete: Task): Promise<void> {
    const { setTask, setTasks, tasks, task } = this.props;

    // Delete the task from state first
    delete tasks[taskToDelete._id];
    setTasks(tasks);
    task.subtasks.splice(task.subtasks.indexOf(taskToDelete._id), 1);
    setTask(task);

    // Make the request to delete the task
    await deleteTaskOnServer(task);
  }

  handleStartDateChange(newDate: MaterialUiPickersDate): void {
    const { setTask, task } = this.props;

    if (newDate) {
      task.startDate = newDate.toDate();
    } else {
      task.startDate = null;
    }
    setTask(task);
    saveTask(task);
  }

  handleDueDateChange(newDate: MaterialUiPickersDate): void {
    const { setTask, task } = this.props;

    if (newDate) {
      task.dueDate = newDate.toDate();
    } else {
      task.dueDate = null;
    }
    setTask(task);
    saveTask(task);
  }

  handlePriorityChange(event: React.ChangeEvent<HTMLInputElement>): void {
    // Check to make sure they typed an int
    if (event.target.value.length === 0) {
      this.setState({
        priority: 0,
      });
    } else if (!Number.isNaN(Number.parseInt(event.target.value, 10))) {
      this.setState({
        priority: Number.parseInt(event.target.value, 10),
      });
    }
  }

  handleOpenPrereqTaskDialog(e: React.MouseEvent<HTMLElement>) {
    console.log(e.currentTarget.id);
    this.setState(prevState => {
      return {
        openPrereqTasks: !prevState.openPrereqTasks,
      };
    });
  }

  /**
   * Generates the task expander button only if this task has subtasks.
   */
  generateTaskExpanderButton(): JSX.Element | null {
    const { task } = this.props;
    const { subTasksOpen } = this.state;
    if (task.subtasks.length !== 0) {
      return (
        <Grid item>
          <IconButton
            aria-label="project-expander"
            onClick={() => {
              this.setSubTasksOpen(!subTasksOpen);
            }}
          >
            {subTasksOpen ? <UpIcon /> : <DownIcon />}
          </IconButton>
        </Grid>
      );
    }
    return null;
  }

  /**
   * Generates the Collapse element only if this task has subtasks.
   */
  generateSubTaskCollapse(): JSX.Element | null {
    const { task, setTask, classes, tasks, setTasks } = this.props;
    const { subTasksOpen } = this.state;
    const { deleteSubTask } = this;
    if (task.subtasks.length !== 0) {
      return (
        <Collapse in={subTasksOpen} timeout="auto" className={classes.root}>
          <List>
            {task.subtasks.map(taskId => (
              <TaskRow
                key={taskId}
                deleteSubTask={deleteSubTask}
                setTasks={setTasks}
                setTask={setTask}
                classes={classes}
                task={tasks[taskId]}
                tasks={tasks}
              />
            ))}
          </List>
        </Collapse>
      );
    }
    return null;
  }

  render() {
    const { tasks, task, classes } = this.props;
    const { title, note, priority, openPrereqTasks } = this.state;
    const {
      handleTitleChange,
      handleLoseFocus,
      generateSubTaskCollapse,
      generateTaskExpanderButton,
      deleteTask,
      addSubTask,
      handleNoteChange,
      handleDueDateChange,
      handlePriorityChange,
      handleStartDateChange,
      handleOpenPrereqTaskDialog,
    } = this;
    return (
      <ListItem key={task._id} className={classes.root}>
        <Grid container spacing={4} justify="space-between" alignItems="center">
          {generateTaskExpanderButton()}
          <Grid item>
            <TextField
              key={task._id}
              label="Title"
              value={title}
              variant="outlined"
              onChange={handleTitleChange}
              onBlur={handleLoseFocus}
            />
          </Grid>
          <Grid item>
            <TextField
              label="Notes"
              value={note}
              multiline
              variant="outlined"
              onChange={handleNoteChange}
              onBlur={handleLoseFocus}
            />
          </Grid>
          <Grid item>
            <TextField
              onChange={handlePriorityChange}
              label="Priority"
              value={priority}
              onBlur={handleLoseFocus}
            />
          </Grid>
          <Grid item>
            <DatePicker
              variant="dialog"
              clearable
              onBlur={handleLoseFocus}
              label="Start Date"
              value={task.startDate}
              onChange={handleStartDateChange}
            />
          </Grid>
          <Grid item>
            <DatePicker
              variant="dialog"
              label="Due Date"
              value={task.dueDate}
              onBlur={handleLoseFocus}
              clearable
              onChange={handleDueDateChange}
            />
          </Grid>
          <Grid item>
            <TaskMenu
              addSubTask={addSubTask}
              deleteTask={deleteTask}
              openPrereqTaskDialog={handleOpenPrereqTaskDialog}
            />
          </Grid>
          <PrereqTaskDialog
            tasks={tasks}
            parentTask={task}
            openDialog={openPrereqTasks}
            closeDialog={handleOpenPrereqTaskDialog}
          />
          {generateSubTaskCollapse()}
        </Grid>
      </ListItem>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TaskRow);

export type DeleteTaskFunction = typeof TaskRow.prototype.deleteTask;

export type AddSubTaskFunction = typeof TaskRow.prototype.addSubTask;

export type OpenPrereqTaskFunction = typeof TaskRow.prototype.handleOpenPrereqTaskDialog;
