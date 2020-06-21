import React from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Collapse,
} from '@material-ui/core';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import AddListIcon from '@material-ui/icons/PlaylistAdd';
import { Project, TaskObjects, Task } from '../dbTypes';
import TaskRow from './TaskRow';
import { SetTaskFunction, SetTasksFunction, SetProjectFunction } from '../App';
import { postNewTask, deleteTask } from '../fetchMethods';

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
    iconNutton: {
      backgroundColor: theme.palette.secondary.main,
      '&:hover': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
    iconButtonHover: {
      backgroundColor: theme.palette.primary.main,
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
}

class ProjectRow extends React.Component<ProjectRowProps, ProjectRowState> {
  constructor(props: ProjectRowProps) {
    super(props);
    this.state = { open: false, anchor: blankMouse };

    this.addSubTask = this.addSubTask.bind(this);
    this.bindOpen = this.bindOpen.bind(this);
    this.setOpen = this.setOpen.bind(this);
    this.handleAddNewTaskClick = this.handleAddNewTaskClick.bind(this);
    this.deleteSubTask = this.deleteSubTask.bind(this);
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
    const { open } = this.state;
    const { setOpen, handleAddNewTaskClick, deleteSubTask } = this;
    return (
      <>
        <TableRow className={classes.root} key={project._id}>
          <TableCell>
            <IconButton
              aria-label="project-expander"
              onClick={() => {
                setOpen(!open);
              }}
            >
              {open ? <UpIcon /> : <DownIcon />}
            </IconButton>
          </TableCell>
          <TableCell align="left">{project.title}</TableCell>
          <TableCell align="left">{project.note}</TableCell>
          <TableCell align="left">{project.dateCreated}</TableCell>
          <TableCell align="right">
            <IconButton
              aria-label="new-project-task-button"
              onClick={handleAddNewTaskClick}
            >
              <AddListIcon fontSize="large" />
            </IconButton>
            {/*
          <NewItemMenu
            itemName={newTaskTitle}
            parentId={project._id}
            handleConfirm={addTaskToProject}
            anchor={anchor}
            handleClose={setAnchor}
          />
          */}
            {/* <Menu
            keepMounted
            open={anchor.mouseX !== null}
            anchorReference="anchorPosition"
            onClose={() => setAnchor(blankMouse)}
            anchorPosition={
              anchor.mouseX && anchor.mouseY
                ? { top: anchor.mouseY, left: anchor.mouseX }
                : undefined
            }
          >
            <TextField
              error={newTaskTitle.length === 0}
              label="Task Title"
              onChange={handleTaskInput}
              value={newTaskTitle}
            />
            <IconButton onClick={() => addTaskToProject(project._id)}>
              <AddIcon />
            </IconButton>
          </Menu> */}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={6}>
            <Collapse in={open} timeout="auto">
              {project.subtasks.map(task => (
                <TaskRow
                  setTasks={setTasks}
                  setTask={setTask}
                  task={tasks[task]}
                  tasks={tasks}
                  deleteSubTask={deleteSubTask}
                />
              ))}
            </Collapse>
          </TableCell>
        </TableRow>
      </>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectRow);

export type DeleteSubTaskFunction = typeof ProjectRow.prototype.deleteSubTask;
