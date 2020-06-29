import React, { useState } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Grid,
  Card,
  Collapse,
} from '@material-ui/core';
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
import scheduleCallback from '../logic/savingTimer';
import sortingFunctions from '../logic/sortingFunctions';
import PriorityButton from './PriorityButton/PriorityButton';
import TaskExpanderButton from './TaskExpanderButton';

function styles(theme: Theme) {
  return createStyles({
    root: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    flexGrow: {
      flexGrow: 1,
    },
    card: {
      flexGrow: 1,
      padding: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    nested: {
      marginLeft: theme.spacing(2),
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

/**
 * Represents a row for a task, which is under a project or another task in
 * the UI.
 *
 * @param {TaskRowProps} props the props
 */
function TaskRow(props: TaskRowProps): JSX.Element {
  const { task, setTasks, tasks, setTask, deleteTask, classes } = props;
  const [sortBy, setSortBy] = useState('Priority');
  const [subTasksOpen, setSubTasksOpen] = useState(false);

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
    <>
      <div className={classes.root}>
        <TaskExpanderButton
          open={subTasksOpen}
          setOpen={setSubTasksOpen}
          parent={task}
        />
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
                <PriorityButton
                  savePriority={savePriority}
                  priority={task.priority}
                  projectOrTaskTitle={task.title}
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
      </div>
      <div className={classes.nested}>
        <Collapse in={subTasksOpen} timeout="auto" className={classes.flexGrow}>
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
        </Collapse>
      </div>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(TaskRow);
