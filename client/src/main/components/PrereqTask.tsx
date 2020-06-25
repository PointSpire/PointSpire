import React from 'react';
import { Grid, Typography, List, ListItem } from '@material-ui/core';
import { Task } from '../logic/dbTypes';

export interface PrereqTaskProps {
  task: Task;
  handleClick: (taskId: string) => void;
  isMainTaskList: boolean;
}

const PrereqTask = (props: PrereqTaskProps): JSX.Element => {
  const { task, isMainTaskList, handleClick } = props;
  return (
    <Grid item>
      <List dense component="div" role="list">
        {isMainTaskList ? (
          <ListItem button onClick={() => handleClick(task._id)}>
            <Typography key={`title-${task._id}`}>{task.title}</Typography>
          </ListItem>
        ) : (
          <ListItem>
            <Typography key={`title-${task._id}`}>{task.title}</Typography>
          </ListItem>
        )}
      </List>
    </Grid>
  );
};

export default PrereqTask;
