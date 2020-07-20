import React, { MouseEvent } from 'react';
import {
  Grid,
  List,
  Paper,
  ListItem,
  Typography,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import UserData from '../../clientData/UserData';

function styles(theme: Theme) {
  return createStyles({
    mainList: {
      padding: theme.spacing(1),
    },
    itemPrimary: {
      backgroundColor: theme.palette.primary.light,
      margin: theme.spacing(1),
      padding: theme.spacing(0.5),
    },
    itemSecondary: {
      backgroundColor: theme.palette.secondary.light,
      margin: theme.spacing(1),
      padding: theme.spacing(0.5),
    },
  });
}

export interface AllPrereqTaskListProps extends WithStyles<typeof styles> {
  prereqsList: string[];
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const AllPrereqTaskList = (props: AllPrereqTaskListProps): JSX.Element => {
  const { classes, prereqsList, handlePrereqTaskChange } = props;

  const tasks = UserData.getTasks();
  const projects = UserData.getProjects();

  const taskDisp = prereqsList.filter(t => tasks[t] !== undefined);
  const projectDisp = prereqsList.filter(p => projects[p] !== undefined);

  return (
    <Grid item>
      <Typography>Projects</Typography>
      <List dense component="div" role="list">
        {projectDisp.length > 0 ? (
          <Paper className={classes.mainList}>
            {projectDisp.map(p => {
              return (
                <Paper key={`sel-proj-${p}`} className={classes.itemPrimary}>
                  <ListItem id={p} button onClick={handlePrereqTaskChange}>
                    <Typography>{projects[p]?.title}</Typography>
                  </ListItem>
                </Paper>
              );
            })}
          </Paper>
        ) : (
          <Typography align="center">None</Typography>
        )}
      </List>
      <Typography>Tasks</Typography>
      <List dense component="div" role="list">
        {taskDisp.length > 0 ? (
          <Paper className={classes.mainList}>
            {taskDisp.map(t => {
              return (
                <Paper key={`sel-task-${t}`} className={classes.itemSecondary}>
                  <ListItem id={t} button onClick={handlePrereqTaskChange}>
                    <Typography>{tasks[t]?.title}</Typography>
                  </ListItem>
                </Paper>
              );
            })}
          </Paper>
        ) : (
          <Typography align="center">None</Typography>
        )}
      </List>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(AllPrereqTaskList);
