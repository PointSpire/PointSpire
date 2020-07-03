import React, { MouseEvent } from 'react';
import {
  Grid,
  List,
  Paper,
  ListItem,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
  ListSubheader,
  ListItemText,
} from '@material-ui/core';
import { ProjectObjects, TaskObjects } from '../logic/dbTypes';

function styles(theme: Theme) {
  return createStyles({
    projectItem: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(0.5),
      margin: theme.spacing(1),
    },
    itemPrimary: {
      margin: theme.spacing(1),
      backgroundColor: theme.palette.primary.light,
    },
    itemSecondary: {
      backgroundColor: theme.palette.secondary.light,
    },
  });
}

export interface PrereqTaskListProps extends WithStyles<typeof styles> {
  tasks: TaskObjects;
  projects: ProjectObjects;
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const PrereqTaskMainList = (props: PrereqTaskListProps): JSX.Element => {
  const { classes, projects, tasks, handlePrereqTaskChange } = props;

  const projectList = Object.values(projects);
  return (
    <Grid item>
      <List subheader={<li />} dense>
        {projectList.map(prj => (
          <Paper className={classes.projectItem}>
            <li key={`project-${prj._id}`}>
              <ul>
                <ListSubheader>{prj.title}</ListSubheader>
                {prj.subtasks?.map(t => (
                  <Paper className={classes.itemPrimary}>
                    <ListItem
                      key={`task-${prj._id}-${t}`}
                      id={t}
                      button
                      onClick={handlePrereqTaskChange}
                    >
                      <ListItemText primary={tasks[t]?.title} />
                    </ListItem>
                  </Paper>
                ))}
              </ul>
            </li>
          </Paper>
        ))}
      </List>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskMainList);
