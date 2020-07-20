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
  // ListSubheader,
  ListItemText,
  Button,
} from '@material-ui/core';
import UserData from '../../clientData/UserData';

function styles(theme: Theme) {
  return createStyles({
    projectItem: {
      backgroundColor: theme.palette.background.paper,
      padding: theme.spacing(0.5),
      margin: theme.spacing(1),
    },
    itemPrimary: {
      backgroundColor: theme.palette.primary.light,
    },
    itemSecondary: {
      backgroundColor: theme.palette.secondary.light,
    },
  });
}

export interface PrereqTaskListProps extends WithStyles<typeof styles> {
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const PrereqProjectTaskList = (props: PrereqTaskListProps): JSX.Element => {
  const { classes, handlePrereqTaskChange } = props;

  const projectList = Object.values(UserData.getProjects());
  const tasks = UserData.getTasks();

  return (
    <Grid item>
      <List subheader={<li />} dense>
        {projectList.map(prj => (
          <Paper
            className={classes.projectItem}
            key={`project-paper-${prj._id}`}
          >
            <li key={`project-${prj._id}`}>
              <ul>
                {/* <ListSubheader>{prj.title}</ListSubheader> */}
                <Button
                  id={prj._id}
                  variant="text"
                  onClick={handlePrereqTaskChange}
                >
                  {prj.title}
                </Button>
                {prj.subtasks?.map(t => (
                  <Paper
                    className={classes.itemPrimary}
                    key={`task-${prj._id}-${t}`}
                  >
                    <ListItem id={t} button onClick={handlePrereqTaskChange}>
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

export default withStyles(styles, { withTheme: true })(PrereqProjectTaskList);
