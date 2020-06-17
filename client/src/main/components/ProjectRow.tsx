import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  // Typography,
  // Paper,
  IconButton,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Collapse,
} from '@material-ui/core';
import UpIcon from '@material-ui/icons/ArrowUpward';
import DownIcon from '@material-ui/icons/ArrowDownward';
import { Project, TaskObjects } from '../dbTypes';
import TaskRow from './TaskRow';

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

export interface ProjectRowProps extends WithStyles<typeof styles> {
  project: Project;
  tasks: TaskObjects;
}

function ProjectRow(props: ProjectRowProps) {
  const { classes, project, tasks } = props;
  const [open, setOpen] = useState<boolean>(false);
  return (
    <>
      <TableRow className={classes.root}>
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
        <TableCell align="right">{project.title}</TableCell>
        <TableCell align="right">{project.note}</TableCell>
        <TableCell align="right">{project.dateCreated}</TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={6}>
          <Collapse in={open} timeout="auto">
            {project.subtasks.map(task => (
              <TaskRow task={tasks[task]} tasks={tasks} />
            ))}
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectRow);
