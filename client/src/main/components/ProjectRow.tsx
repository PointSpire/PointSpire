import React from 'react';
import {
  IconButton,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Collapse,
  Grid,
  List,
  ListItem,
  TextField,
  Card,
} from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import AddListIcon from '@material-ui/icons/PlaylistAdd';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Project, TaskObjects, Task } from '../dbTypes';
import TaskRow from './TaskRow';
import { SetTaskFunction, SetTasksFunction, SetProjectFunction } from '../App';
import { postNewTask, deleteTask, patchProject } from '../fetchMethods';

function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
      borderColor: theme.palette.secondary.main,
    },
    iconButton: {
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
    iconButtonHover: {
      backgroundColor: theme.palette.primary.main,
    },
    card: {
      padding: theme.spacing(2),
    },
  });
}

const blankMouse: MousePos = {
  mouseX: null,
  mouseY: null,
};

type MousePos = {
  mouseX: number | null;
  mouseY: number | null;
};

/**
 * Saves the project to the server and logs to the console what happened.
 *
 * @param {Project} project the updated Project
 */
function saveProject(project: Project): void {
  patchProject(project)
    .then(result => {
      if (result) {
        // eslint-disable-next-line
        console.log('Project was successfully saved to the server');
      } else {
        // eslint-disable-next-line
        console.log('Project was not saved to the server. There was an error.');
      }
    })
    .catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
}

export interface ProjectRowProps extends WithStyles<typeof styles> {
  project: Project;
  tasks: TaskObjects;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  setProject: SetProjectFunction;
}

export interface ProjectRowState {
  open: boolean;
  anchor: MousePos;
  priority: number;
  title: string;
  note: string;
}

class ProjectRow extends React.Component<ProjectRowProps, ProjectRowState> {
  constructor(props: ProjectRowProps) {
    super(props);

    const { project } = this.props;
    this.state = {
      open: false,
      anchor: blankMouse,
      priority: project.priority,
      title: project.title,
      note: project.note,
    };

    this.addSubTask = this.addSubTask.bind(this);
    this.bindOpen = this.bindOpen.bind(this);
    this.setOpen = this.setOpen.bind(this);
    this.handleAddNewTaskClick = this.handleAddNewTaskClick.bind(this);
    this.deleteSubTask = this.deleteSubTask.bind(this);
    this.handleLoseFocus = this.handleLoseFocus.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
    this.handlePriorityChange = this.handlePriorityChange.bind(this);
    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleDueDateChange = this.handleDueDateChange.bind(this);
  }

  setAnchor(anchor: MousePos): void {
    this.setState({
      anchor,
    });
  }

  setOpen(open: boolean): void {
    this.setState({
      open,
    });
  }

  handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      title: event.target.value,
    });
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

  handleNoteChange(event: React.ChangeEvent<HTMLInputElement>): void {
    this.setState({
      note: event.target.value,
    });
  }

  handleStartDateChange(newDate: MaterialUiPickersDate): void {
    const { setProject, project } = this.props;

    if (newDate) {
      project.startDate = newDate.toDate();
    } else {
      project.startDate = null;
    }
    setProject(project);
    saveProject(project);
  }

  handleDueDateChange(newDate: MaterialUiPickersDate): void {
    const { setProject, project } = this.props;

    if (newDate) {
      project.dueDate = newDate.toDate();
    } else {
      project.dueDate = null;
    }
    setProject(project);
    saveProject(project);
  }

  /**
   * Handles losing focus on an input element. This will save the project to the
   * applications state and on the server.
   */
  handleLoseFocus(): void {
    const { setProject, project } = this.props;
    const { title, note, priority } = this.state;
    project.title = title;
    project.note = note;
    project.priority = priority;
    setProject(project);
    saveProject(project);
  }

  /**
   * Adds a new task to this project on the server and in state.
   *
   * @param {string} title the title of the new task
   */
  async addSubTask(title: string): Promise<void> {
    const { setTasks, tasks, project, setProject } = this.props;

    // Make the request for the new task
    const newTask = await postNewTask('project', project._id, title);

    // Add the new task to the task objects
    tasks[newTask._id] = newTask;
    setTasks(tasks);

    // Add the new task to the project
    project.subtasks.push(newTask._id);
    setProject(project);
  }

  /**
   * Deletes the given task from state and from the server.
   *
   * @param {Task} task the task to delete
   */
  async deleteSubTask(task: Task): Promise<void> {
    const { setTasks, tasks, project, setProject } = this.props;

    // Delete the task from state first
    delete tasks[task._id];
    setTasks(tasks);
    project.subtasks.splice(project.subtasks.indexOf(task._id), 1);
    setProject(project);

    // Make the request to delete the task
    await deleteTask(task);
  }

  handleAddNewTaskClick(): void {
    this.addSubTask('Untitled').catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });

    /* TODO: Try to get the transition to run when it opens. Right now it
    doesn't. */
    this.setOpen(true);
  }

  bindOpen(e: React.MouseEvent<HTMLElement>): void {
    const { anchor } = this.state;
    // eslint-disable-next-line
    console.log(anchor);
    this.setAnchor({
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  }

  render(): JSX.Element {
    const { classes, project, tasks, setTask, setTasks } = this.props;
    const { open, title, note, priority } = this.state;
    const {
      setOpen,
      handleAddNewTaskClick,
      deleteSubTask,
      handleNoteChange,
      handlePriorityChange,
      handleTitleChange,
      handleLoseFocus,
      handleDueDateChange,
      handleStartDateChange,
    } = this;
    return (
      <ListItem className={classes.root} key={project._id}>
        <Card variant="outlined" className={`${classes.card} ${classes.root}`}>
          <Grid
            container
            spacing={1}
            justify="space-between"
            alignItems="center"
          >
            <Grid item>
              <IconButton
                aria-label="project-expander"
                onClick={() => {
                  setOpen(!open);
                }}
              >
                {open ? <UpIcon /> : <DownIcon />}
              </IconButton>
            </Grid>
            <Grid item>
              <TextField
                onChange={handleTitleChange}
                label="Project Title"
                value={title}
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
                value={project.startDate}
                onChange={handleStartDateChange}
              />
            </Grid>
            <Grid item>
              <DatePicker
                variant="dialog"
                label="Due Date"
                value={project.dueDate}
                onBlur={handleLoseFocus}
                clearable
                onChange={handleDueDateChange}
              />
            </Grid>
            <Grid item>
              <IconButton
                aria-label="new-project-task-button"
                onClick={handleAddNewTaskClick}
              >
                <AddListIcon fontSize="large" />
              </IconButton>
            </Grid>
            <Grid item className={classes.root}>
              <TextField
                multiline
                id="note"
                label="Project Note"
                value={note}
                onChange={handleNoteChange}
                fullWidth
                onBlur={handleLoseFocus}
              />
            </Grid>
            <Collapse in={open} timeout="auto" className={classes.root}>
              <List>
                {project.subtasks.map(task => (
                  <TaskRow
                    setTasks={setTasks}
                    setTask={setTask}
                    task={tasks[task]}
                    tasks={tasks}
                    deleteSubTask={deleteSubTask}
                  />
                ))}
              </List>
            </Collapse>
          </Grid>
        </Card>
      </ListItem>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectRow);

export type DeleteSubTaskFunction = typeof ProjectRow.prototype.deleteSubTask;
