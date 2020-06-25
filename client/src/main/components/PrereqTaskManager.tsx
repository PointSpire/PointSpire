import React, { useState } from 'react';
import {
  Grid,
  Divider,
  Typography,
  IconButton,
  InputBase,
  Paper,
  List,
  ListItem,
} from '@material-ui/core';
import { Add as AddIcon, Search as SearchIcon } from '@material-ui/icons';
import { Task, TaskObjects } from '../logic/dbTypes';
// import PrereqTask from './PrereqTask';

export interface PrereqTaskManagerProps {
  parentTask: Task;
  allTasks: TaskObjects;
  handlePrereqTaskChange: (taskIds: string[]) => void;
}

const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const { parentTask, allTasks, handlePrereqTaskChange } = props;
  const allTaskIds = Object.keys(allTasks);
  const [selectedTasks, setSelectedtasks] = useState<string[]>(
    parentTask.prereqTasks === undefined ? [] : parentTask.prereqTasks
  );

  const handlePrereqTaskClick = (taskId: string) => {
    const taskIndex = selectedTasks.indexOf(taskId);
    if (taskIndex !== -1) {
      const newSelectedTasks = selectedTasks;
      newSelectedTasks.splice(taskIndex, 1);
      setSelectedtasks(newSelectedTasks);
    } else {
      const newSelectedTasks = selectedTasks;
      newSelectedTasks.push(taskId);
      setSelectedtasks(newSelectedTasks);
    }
  };

  const handleRemovePrereqTaskClick = (taskId: string) => {
    if (selectedTasks.includes(taskId)) {
      const taskIndex = selectedTasks.indexOf(taskId);
      const newSelectedTasks = selectedTasks;
      newSelectedTasks.splice(taskIndex, 1);
      setSelectedtasks(newSelectedTasks);
    }
  };

  const handleAddPrereqClick = () => {
    handlePrereqTaskChange(selectedTasks);
  };

  const generateMainTaskList = (tasklist: string[]) => {
    return tasklist.map(t => {
      return (
        <Grid item key={`all-task-${t}`}>
          <List dense component="div" role="list">
            <ListItem button onClick={() => handlePrereqTaskClick(t)}>
              <Typography>{allTasks[t].title}</Typography>
            </ListItem>
          </List>
        </Grid>
      );
    });
  };

  const generatePrereqTaskList = (taskIds: string[]) => {
    return taskIds && taskIds.length > 0 ? (
      taskIds.map(t => {
        return (
          <Grid item key={`prereq-task-${t}`}>
            <List dense component="div" role="list">
              <ListItem button onClick={() => handleRemovePrereqTaskClick(t)}>
                <Typography>{allTasks[t]?.title}</Typography>
              </ListItem>
            </List>
          </Grid>
        );
      })
    ) : (
      <Grid item>
        <Typography>No Prerequisite Tasks</Typography>
      </Grid>
    );
  };

  return (
    <div>
      <Grid container direction="column">
        <Grid item>
          <Paper>
            <InputBase placeholder="Search Tasks" />
            <IconButton>
              <SearchIcon />
            </IconButton>
          </Paper>
        </Grid>
        {allTasks ? (
          generateMainTaskList(allTaskIds)
        ) : (
          <Typography>You have nothing to do! Wow.</Typography>
        )}
        <Divider orientation="horizontal" />
        <Grid container direction="column">
          <IconButton onClick={handleAddPrereqClick}>
            <AddIcon />
          </IconButton>
        </Grid>
        <Divider orientation="horizontal" />
        {selectedTasks.length > 0 ? (
          generatePrereqTaskList(selectedTasks)
        ) : (
          <Typography>No Prerequisite Tasks</Typography>
        )}
      </Grid>
    </div>
  );
};

export default PrereqTaskManager;