import React from 'react';
import { Grid, Typography, Checkbox, List, ListItem } from '@material-ui/core';
import { Task } from '../logic/dbTypes';

export interface PrereqTaskProps {
  task: Task;
  isChecked: boolean;
  handleChecked: (taskId: string) => void;
  useCheckBox: boolean;
  // sendChecked: (taskId: string, isChecked: boolean) => void;
}

const PrereqTask = (props: PrereqTaskProps): JSX.Element => {
  const { task, isChecked, useCheckBox, handleChecked } = props;
  return (
    <Grid item>
      <List dense component="div" role="list">
        <ListItem>
          {useCheckBox ? (
            <Checkbox
              checked={isChecked}
              onClick={() => {
                handleChecked(task._id);
              }}
            />
          ) : (
            ''
          )}
          <Typography key={`title-${task._id}`}>{task.title}</Typography>
        </ListItem>
      </List>
    </Grid>
  );
};

export default PrereqTask;
