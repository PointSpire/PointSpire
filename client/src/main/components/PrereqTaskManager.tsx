import React, { useState } from 'react';
import { Grid, Divider, Typography, IconButton } from '@material-ui/core';
import { Add as AddIcon } from '@material-ui/icons';
import { Task, TaskObjects } from '../logic/dbTypes';
import PrereqTask from './PrereqTask';

export interface PrereqTaskManagerProps {
  parentTask: Task;
  allTasks: TaskObjects;
}

const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const { parentTask, allTasks } = props;
  const allTaskIds = Object.keys(allTasks);
  const [selectedTasks, setSelectedtasks] = useState<string[]>(
    parentTask.prereqTasks ? parentTask.prereqTasks : []
  );

  const handleCheckedChange = (taskId: string) => {
    const foundTask = allTasks[taskId];
    if (foundTask) {
      const taskIndex = selectedTasks.indexOf(taskId);
      const newSelection = selectedTasks;
      if (taskIndex === -1) {
        // newSelection.splice(allTaskIds.indexOf(taskId), 0, taskId);
        newSelection.push(taskId);
      } else {
        newSelection.splice(taskIndex, 1);
      }
      setSelectedtasks(newSelection);
    }
  };

  const handleAddPrereqClick = () => {
    console.log('handle Add?');
  };

  const generateTaskList = (tasklist: string[], isAllTasks: boolean) => {
    return tasklist.map(t => {
      return (
        <PrereqTask
          task={allTasks[t]}
          handleChecked={handleCheckedChange}
          isChecked={selectedTasks.includes(t)}
          useCheckBox={isAllTasks}
        />
      );
    });
  };

  return (
    <div>
      <Grid container direction="column">
        {allTasks ? (
          generateTaskList(allTaskIds, true)
        ) : (
          <Typography>U got no tasks! Wow.</Typography>
        )}
        <Divider orientation="horizontal" />
        <Grid container direction="column">
          <IconButton onClick={handleAddPrereqClick}>
            <AddIcon />
          </IconButton>
        </Grid>
        <Divider orientation="horizontal" />
        {selectedTasks ? (
          generateTaskList(selectedTasks, false)
        ) : (
          <Typography>No Prerequisite Tasks</Typography>
        )}
      </Grid>
    </div>
  );
};

export default PrereqTaskManager;
