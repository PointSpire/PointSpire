import React, { useState } from 'react';
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
import { Project, TaskObjects } from '../dbTypes';
import TaskRow from './TaskRow';
import { AddTaskToProject, AddTaskToTask } from './ProjectTable';
import { SetTaskFunction } from '../App';

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

const blankMouse = {
  mouseX: null,
  mouseY: null,
};

export interface ProjectRowProps extends WithStyles<typeof styles> {
  project: Project;
  tasks: TaskObjects;
  addTaskToProject: AddTaskToProject;
  addTaskToTask: AddTaskToTask;
  newTaskTitle: string;
  setTask: SetTaskFunction;
}

function ProjectRow(props: ProjectRowProps) {
  const { classes, project, tasks, addTaskToTask, setTask } = props;
  const [open, setOpen] = useState<boolean>(false);
  const [anchor, setAnchor] = useState<{
    mouseX: number | null;
    mouseY: number | null;
  }>(blankMouse);

  const bindOpen = (e: React.MouseEvent<HTMLElement>) => {
    // eslint-disable-next-line
    console.log(anchor);
    setAnchor({
      mouseX: e.clientX,
      mouseY: e.clientY,
    });
  };

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
            className={classes.iconNutton}
            aria-label="new-project-task-button"
            // onClick={(e: React.MouseEvent<HTMLElement>) => {
            //   setAnchor({
            //     mouseX: e.clientX,
            //     mouseY: e.clientY,
            //   });
            // }}
            onClick={bindOpen}
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
        <TableCell colSpan={6} className={classes.nested}>
          <Collapse in={open} timeout="auto">
            {project.subtasks.map(task => (
              <TaskRow
                setTask={setTask}
                task={tasks[task]}
                tasks={tasks}
                addTaskToTask={addTaskToTask}
              />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectRow);
