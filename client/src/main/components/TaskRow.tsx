import React, { useState } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Grid,
  Card,
} from '@material-ui/core';
import { TreeItem } from '@material-ui/lab';
import { Task, TaskObjects } from '../logic/dbTypes';
import { SetTaskFunction, SetTasksFunction } from '../App';
import {
  patchTask,
  deleteTask as deleteTaskOnServer,
  postNewTask,
} from '../logic/fetchMethods';
import TaskMenu from './TaskMenu/TaskMenu';
import NoteInput from './NoteInput';
import DateInput from './DateInput';
import SimpleTextInput from './SimpleTextInput';
import PriorityInput from './PriorityInput';
import scheduleCallback from '../logic/savingTimer';
import sortingFunctions from '../logic/sortingFunctions';

function styles(theme: Theme) {
  return createStyles({
    root: {
      flexGrow: 1,
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    card: {
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
    },
    treeItem: {
      marginTop: theme.spacing(1),
    },
  });
}

export interface TaskRowProps extends WithStyles<typeof styles> {
  task: Task;
  tasks: TaskObjects;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  deleteTask: (task: Task) => Promise<void>;
}

function TaskRow(props: TaskRowProps): JSX.Element {
  const { task, setTasks, tasks, setTask, deleteTask, classes } = props;
  const [sortBy, setSortBy] = useState('Priority');

  /**
   * Saves this task to the server and logs to the console what happened.
   */
  function saveTask(): void {
    patchTask(task)
      .then(result => {
        if (result) {
          // eslint-disable-next-line
          console.log('Task was successfully saved to the server');
        } else {
          // eslint-disable-next-line
          console.log('Task was not saved to the server. There was an error.');
        }
      })
      .catch(err => {
        // eslint-disable-next-line
        console.error(err);
      });
  }

  /**
   * Adds a new sub task to this task on the server and in state. This also
   * opens the subtasks if they weren't already.
   *
   * @param {string} title the title of the new task
   */
  async function addSubTask(title: string): Promise<void> {
    // Make the request for the new task
    const newTask = await postNewTask('task', task._id, title);

    // Add the new task to the task objects
    tasks[newTask._id] = newTask;
    setTasks(tasks);

    // Add the new task to the project
    task.subtasks.push(newTask._id);
    setTask(task);
  }

  /**
   * Deletes this task.
   */
  function deleteThisTask() {
    deleteTask(task).catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
  }

  function saveDueDate(newDate: Date | null): void {
    task.dueDate = newDate;
    setTask(task);
    scheduleCallback(`${task._id}.saveTask`, saveTask);
  }

  function saveStartDate(newDate: Date | null): void {
    task.dueDate = newDate;
    setTask(task);
    scheduleCallback(`${task._id}.saveTask`, saveTask);
  }

  function savePriority(newPriority: number): void {
    task.priority = newPriority;
    setTask(task);
    scheduleCallback(`${task._id}.saveTask`, saveTask);
  }

  /**
   * Generates a function which can be used to modify the specified `property`
   * of the task and schedule it to be saved on the server.
   *
   * @param {'note' | 'title'} property the property to modify on the task state
   * @returns {(newText: string) => void} the function which can be used to
   * save the specified `property` as long as the property is a string type
   */
  function saveText(property: 'note' | 'title') {
    return (newText: string): void => {
      task[property] = newText;
      setTask(task);
      scheduleCallback(`${task._id}.saveTask`, saveTask);
    };
  }

  /**
   * Deletes the given task from state and from the server.
   *
   * @param {Task} task the task to delete
   */
  async function deleteSubTask(taskToDelete: Task): Promise<void> {
    // Delete the task from state first
    delete tasks[taskToDelete._id];
    setTasks(tasks);
    task.subtasks.splice(task.subtasks.indexOf(taskToDelete._id), 1);
    setTask(task);

    // Make the request to delete the task
    await deleteTaskOnServer(task);
  }

  return (
    <TreeItem
      className={`${classes.root} ${classes.treeItem}`}
      nodeId={task._id}
      onLabelClick={event => {
        event.preventDefault();
      }}
      label={
        <Card className={`${classes.card} ${classes.root}`} raised>
          <Grid container justify="flex-start" alignItems="center">
            <Grid
              container
              spacing={2}
              wrap="nowrap"
              alignItems="center"
              justify="flex-start"
            >
              <Grid item className={classes.root}>
                <SimpleTextInput
                  value={task.title}
                  saveValue={saveText('title')}
                  label="Title"
                />
              </Grid>
              <Grid item>
                <PriorityInput
                  savePriority={savePriority}
                  priority={task.priority}
                />
              </Grid>
              <Grid item>
                <DateInput
                  saveDate={saveStartDate}
                  date={task.startDate}
                  label="Start Date"
                />
              </Grid>
              <Grid item>
                <DateInput
                  saveDate={saveDueDate}
                  date={task.dueDate}
                  label="Due Date"
                />
              </Grid>
              <Grid item>
                <TaskMenu
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  addSubTask={addSubTask}
                  deleteTask={deleteThisTask}
                />
              </Grid>
            </Grid>
            <Grid item className={classes.root}>
              <NoteInput
                saveNote={saveText('note')}
                note={task.note}
                label="Task Note"
              />
            </Grid>
          </Grid>
        </Card>
      }
    >
      {Object.values(tasks)
        .filter(currentTask => task.subtasks.includes(currentTask._id))
        .sort(sortingFunctions[sortBy])
        .map(currentTask => (
          <TaskRow
            key={currentTask._id}
            classes={classes}
            setTasks={setTasks}
            setTask={setTask}
            task={currentTask}
            tasks={tasks}
            deleteTask={deleteSubTask}
          />
        ))}
    </TreeItem>
  );
}

export default withStyles(styles, { withTheme: true })(TaskRow);
