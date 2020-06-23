import React /* , { useState } */ from 'react';
import { Grid, Divider, Typography } from '@material-ui/core';
import { Task, TaskObjects } from '../logic/dbTypes';
import PrereqTask from './PrereqTask';

export interface PrereqTaskManagerProps {
  parentTask: Task;
  // tasks: string[];
  allTasks: TaskObjects;
}

const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const { parentTask, allTasks } = props;
  // const [currentPrereq, setPrereqTasks] = useState<string[]>(
  //   parentTask.prereqTasks
  // );

  const generateTaskList = (tasklist: string[]) => {
    return tasklist.map(t => {
      return <PrereqTask task={allTasks[t]} />;
    });
  };

  return (
    <div>
      <Grid container direction="column">
        {generateTaskList(Object.keys(allTasks))}
        <Divider orientation="horizontal" />
        {parentTask.prereqTasks ? (
          generateTaskList(parentTask.prereqTasks)
        ) : (
          <Typography>No Prerequisite Tasks</Typography>
        )}
      </Grid>
    </div>
  );
};

export default PrereqTaskManager;
