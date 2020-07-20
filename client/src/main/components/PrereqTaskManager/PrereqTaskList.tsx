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
    item: {
      backgroundColor: theme.palette.primary.light,
    },
  });
}

export interface PrereqTaskListProps extends WithStyles<typeof styles> {
  taskList: string[];
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const PrereqTaskList = (props: PrereqTaskListProps): JSX.Element => {
  const { classes, taskList, handlePrereqTaskChange } = props;

  const tasks = UserData.getTasks();

  return (
    <Grid item>
      {taskList.map(t => {
        return (
          <List dense component="div" role="list" key={`prereq-task-list-${t}`}>
            <Paper className={classes.item}>
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
