import React from 'react';
import { Grid, List, Paper, ListItem, Typography } from '@material-ui/core';
import { TaskObjects } from '../logic/dbTypes';

export interface PrereqTaskListProps {
  taskList: string[];
  tasks: TaskObjects;
  handlePrereqTaskChange: (taskId: string) => void;
}

export default function PrereqTaskList(
  props: PrereqTaskListProps
): JSX.Element {
  const { taskList, tasks, handlePrereqTaskChange } = props;
  return (
    <Grid item>
      {taskList && taskList.length > 0 ? (
        taskList.map(t => {
          return (
            <List
              dense
              component="div"
              role="list"
              key={`prereq-task-list-${t}`}
            >
              <Paper>
                <ListItem button onClick={() => handlePrereqTaskChange(t)}>
                  <Typography>{tasks[t]?.title}</Typography>
                </ListItem>
              </Paper>
            </List>
          );
        })
      ) : (
        <Typography>No Tasks found.</Typography>
      )}
    </Grid>
  );
}
