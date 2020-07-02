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
import { TaskObjects } from '../logic/dbTypes';

function styles(theme: Theme) {
  return createStyles({
    itemPrimary: {
      backgroundColor: theme.palette.primary.light,
    },
    itemSecondary: {
      backgroundColor: theme.palette.secondary.light,
    },
  });
}

export interface PrereqTaskListProps extends WithStyles<typeof styles> {
  isMainList?: boolean;
  taskList: string[];
  tasks: TaskObjects;
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const PrereqTaskList = (props: PrereqTaskListProps): JSX.Element => {
  const {
    classes,
    isMainList,
    taskList,
    tasks,
    handlePrereqTaskChange,
  } = props;
  return (
    <Grid item>
      {taskList.map(t => {
        return (
          <List dense component="div" role="list" key={`prereq-task-list-${t}`}>
            <Paper
              className={
                isMainList ? classes.itemPrimary : classes.itemSecondary
              }
            >
              <ListItem id={t} button onClick={handlePrereqTaskChange}>
                <Typography>{tasks[t]?.title}</Typography>
              </ListItem>
            </Paper>
          </List>
        );
      })}
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskList);
