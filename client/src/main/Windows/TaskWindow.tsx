import React, { useState } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListSubheader,
  Button,
} from '@material-ui/core/';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import TaskModel from '../../Models/TaskModel';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  })
);

export default function TaskWindow(): JSX.Element {
  const styles = useStyles();

  const [tasks, setTasks] = useState<TaskModel[] | null>(null);

  const mapTasks = (): JSX.Element | JSX.Element[] => {
    if (tasks !== (undefined || null) && tasks.length > 0) {
      return tasks.map(task => {
        return (
          <ListItem button key={task.id}>
            <ListItemText primary={task.title} />
            <ListItemText primary={task.note} />
          </ListItem>
        );
      });
    }
    return (
      <ListItem button={false} key="none">
        <ListItemText primary="No Tasks Found" />
      </ListItem>
    );
  };

  const addTask = (): void => {
    let tempTasks = tasks;
    if (tempTasks === null) {
      tempTasks = [
        TaskModel.buildTask('', 'new', 'task', new Date(Date.now()), []),
      ];
    } else {
      tempTasks.push(new TaskModel());
    }
    setTasks(tempTasks);
  };

  return (
    <div>
      <List
        component="li"
        className={styles.root}
        aria-label="task-list"
        /* eslint-disable */
        subheader={
          <ListSubheader component="div" id="task-list-sub"> 
            Tasks
          </ListSubheader>
        }
        /* eslint-enable */
      >
        {mapTasks()}
        <Button variant="contained" color="primary" onClick={addTask}>
          Add Task
        </Button>
      </List>
    </div>
  );
}
