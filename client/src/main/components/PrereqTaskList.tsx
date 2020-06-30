import React, { MouseEvent } from 'react';
import { Grid, List, Paper, ListItem, Typography } from '@material-ui/core';
import { TaskObjects } from '../logic/dbTypes';

export interface PrereqTaskListProps {
  taskList: string[];
  tasks: TaskObjects;
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const PrereqTaskList = (props: PrereqTaskListProps): JSX.Element => {
  const { taskList, tasks, handlePrereqTaskChange } = props;
  return (
    <Grid item>
      {taskList.map(t => {
        return (
          <List dense component="div" role="list" key={`prereq-task-list-${t}`}>
            <Paper>
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

export default PrereqTaskList;
