import React, { useState, useEffect } from 'react';
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
  Tooltip,
} from '@material-ui/core';
import { DatePicker } from '@material-ui/pickers';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import AddListIcon from '@material-ui/icons/PlaylistAdd';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Project, TaskObjects, Task } from '../logic/dbTypes';
import TaskRow from './TaskRow';
import { SetTaskFunction, SetTasksFunction, SetProjectFunction } from '../App';
import { postNewTask, deleteTask, patchProject } from '../logic/fetchMethods';
import scheduleCallback, { resetTimer } from '../logic/savingTimer';
import Note from './Note';

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

export interface ProjectRowProps extends WithStyles<typeof styles> {
  project: Project;
  tasks: TaskObjects;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  setProject: SetProjectFunction;
}

export interface ProjectRowState {
  open: boolean;
  priority: number;
  title: string;
}

function shouldProjectRowSkipUpdate(
  oldProps: ProjectRowProps,
  newProps: ProjectRowProps
): boolean {
  if (oldProps.project === newProps.project) {
    return true;
  }
  return false;
}

const ProjectRow = React.memo((props: ProjectRowProps) => {
  const { project, classes, tasks, setTask, setTasks, setProject } = props;

  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState(project.priority);
  const [title, setTitle] = useState(project.title);

  // Reset the timer whenever a change is made
  useEffect(() => {
    resetTimer();
  });

  function handleTitleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setTitle(event.target.value);
  }

  function handlePriorityChange(
    event: React.ChangeEvent<HTMLInputElement>
  ): void {
    // Check to make sure they typed an int
    if (event.target.value.length === 0) {
      setPriority(0);
    } else if (!Number.isNaN(Number.parseInt(event.target.value, 10))) {
      setPriority(Number.parseInt(event.target.value, 10));
    }
  }

  /**
   * Saves the project in state to the server and logs to the console what
   * happened.
   */
  function saveProject(): void {
    patchProject(project)
      .then(result => {
        if (result) {
          // eslint-disable-next-line
          console.log('Project was successfully saved to the server');
        } else {
          // eslint-disable-next-line
          console.log(
            'Project was not saved to the server. There was an error.'
          );
        }
      })
      .catch(err => {
        // eslint-disable-next-line
        console.error(err);
      });
  }

  function handleDueDateChange(newDate: MaterialUiPickersDate): void {
    if (newDate) {
      project.dueDate = newDate.toDate();
    } else {
      project.dueDate = null;
    }
    setProject(project);
    scheduleCallback('ProjectRow.saveProject', saveProject);
  }

  function handleStartDateChange(newDate: MaterialUiPickersDate): void {
    if (newDate) {
      project.startDate = newDate.toDate();
    } else {
      project.startDate = null;
    }
    setProject(project);

    scheduleCallback('ProjectRow.saveProject', saveProject);
  }

  function saveNote(note: string): void {
    project.note = note;
    setProject(project);
    scheduleCallback('ProjectRow.saveProject', saveProject);
  }

  /**
   * Handles losing focus on an input element. This will save the project to the
   * applications state and on the server.
   */
  function handleLoseFocus(): void {
    project.title = title;
    project.priority = priority;
    setProject(project);
    scheduleCallback('ProjectRow.saveProject', saveProject);
  }

  /**
   * Adds a new task to this project on the server and in state.
   *
   * @param {string} newTitle the title of the new task
   */
  async function addSubTask(newTitle: string): Promise<void> {
    // Make the request for the new task
    const newTask = await postNewTask('project', project._id, newTitle);

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
  async function deleteSubTask(task: Task): Promise<void> {
    // Delete the task from state first
    delete tasks[task._id];
    setTasks(tasks);
    project.subtasks.splice(project.subtasks.indexOf(task._id), 1);
    setProject(project);

    // Make the request to delete the task
    await deleteTask(task);
  }

  function handleAddNewTaskClick(): void {
    addSubTask('Untitled').catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });

    /* TODO: Try to get the transition to run when it opens. Right now it
    doesn't. */
    setOpen(true);
  }

  return (
    <ListItem className={classes.root} key={project._id}>
      <Card variant="outlined" className={`${classes.card} ${classes.root}`}>
        <Grid container spacing={1} justify="space-between" alignItems="center">
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
              clearable
              onChange={handleDueDateChange}
            />
          </Grid>
          <Grid item>
            <Tooltip title="Add Subtask">
              <IconButton
                aria-label="new-project-task-button"
                onClick={handleAddNewTaskClick}
              >
                <AddListIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Grid>
          <Grid item className={classes.root}>
            <Note
              saveNote={saveNote}
              note={project.note}
              label="Project Note"
            />
          </Grid>
          <Collapse
            in={open}
            timeout="auto"
            className={classes.root}
            component={List}
          >
            <List>
              {project.subtasks.map(taskId => (
                <TaskRow
                  key={taskId}
                  setTasks={setTasks}
                  setTask={setTask}
                  task={tasks[taskId]}
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
}, shouldProjectRowSkipUpdate);

export default withStyles(styles, { withTheme: true })(ProjectRow);
