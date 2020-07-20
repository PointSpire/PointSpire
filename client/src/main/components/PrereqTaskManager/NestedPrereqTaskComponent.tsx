import React, { MouseEvent } from 'react';
import {
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
      padding: theme.spacing(0.5),
      margin: theme.spacing(1),
    },
  });
}

export interface NestedPrereqTaskListProps extends WithStyles<typeof styles> {
  taskList: string[];
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const NestedPrereqTaskList = (
  props: NestedPrereqTaskListProps
): JSX.Element => {
  const { classes, taskList, handlePrereqTaskChange } = props;

  const tasks = UserData.getTasks();

  return (
    <>
      {taskList.map(t => {
        return (
          <Paper className={classes.item} key={`task-nested-${t}`}>
            <ListItem id={t} button onClick={handlePrereqTaskChange}>
              <Typography>{tasks[t]?.title}</Typography>
            </ListItem>
          </Paper>
        );
      })}
    </>
  );
};

export default withStyles(styles, { withTheme: true })(NestedPrereqTaskList);
