import React, { useState } from 'react';
import { Grid, Typography, Checkbox, List, ListItem } from '@material-ui/core';
import { Task } from '../logic/dbTypes';

export interface PrereqTaskProps {
  task: Task;
}

const PrereqTask = (props: PrereqTaskProps) => {
  const { task } = props;
  const [isChecked, setChecked] = useState<boolean>(false);
  return (
    <Grid item>
      <List dense component="div" role="list">
        <ListItem>
          <Checkbox
            checked={isChecked}
            onClick={() => setChecked(!isChecked)}
          />
          <Typography key={`title-${task._id}`}>{task.title}</Typography>
        </ListItem>
      </List>
    </Grid>
  );
};

export default PrereqTask;
