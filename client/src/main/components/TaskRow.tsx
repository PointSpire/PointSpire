import React, { useState } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  ListItem,
  List,
  Collapse,
  Grid,
} from '@material-ui/core';
import { Task, TaskObjects } from '../logic/dbTypes';
import { SetTaskFunction, SetTasksFunction } from '../App';
import {
  patchTask,
  deleteTask as deleteTaskOnServer,
  postNewTask,
} from '../logic/fetchMethods';
import TaskMenu from './TaskMenu';
import PrereqTaskDialog from './PrereqTaskDialog';
import NoteInput from './NoteInput';
import DateInput from './DateInput';
import SimpleTextInput from './SimpleTextInput';
import PriorityInput from './PriorityInput';
import scheduleCallback from '../logic/savingTimer';
import TaskExpanderButton from './TaskExpanderButton';

function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
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
  const [open, setOpen] = useState(false);
  const [openPrereqTasks, setOpenPrereqTasks] = useState<boolean>(false);

  // /**
  //  * Handles losing focus on an input element. This will save the task to the
  //  * applications state.
  //  */
  // handleLoseFocus(): void {
  //   const { setTask, task } = this.props;
  //   const { title, note, priority } = this.state;
  //   task.title = title;
  //   task.note = note;
  //   task.priority = priority;
  //   setTask(task);
  //   saveTask(task);
  // }

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

  const handlePrereqTaskChange = (prereqTasks: string[]): void => {
    task.prereqTasks = prereqTasks;
    setTask(task);
    saveTask();
  };

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

    setOpen(true);
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
   * Determines wether the closing element is the save button. If so, saves
   * the Task to the server.
   * @param e Event args. Used for the closing element id only.
   */
  const handleOpenPrereqTaskDialog = (
    e: React.MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => {
    setOpenPrereqTasks(!openPrereqTasks);

    if (e.currentTarget.id === 'save-prereq-tasks') {
      if (prereqTasks) {
        handlePrereqTaskChange(prereqTasks);
      }
    }
  };

  /**
   * Generates the task expander button only if this task has subtasks.
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
    <ListItem key={task._id} className={classes.root}>
      <Grid container spacing={4} justify="space-between" alignItems="center">
        <TaskExpanderButton parent={task} open={open} setOpen={setOpen} />
        <Grid item>
          <SimpleTextInput
            value={task.title}
            saveValue={saveText('title')}
            label="Title"
          />
        </Grid>
        <Grid item>
          <PriorityInput savePriority={savePriority} priority={task.priority} />
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
            addSubTask={addSubTask}
            deleteTask={deleteThisTask}
            openPrereqTaskDialog={handleOpenPrereqTaskDialog}
          />
        </Grid>
        <Grid item className={classes.root}>
          <NoteInput
            saveNote={saveText('note')}
            note={task.note}
            label="Task Note"
          />
        </Grid>
        <PrereqTaskDialog
          tasks={tasks}
          parentTask={task}
          openDialog={openPrereqTasks}
          closeDialog={handleOpenPrereqTaskDialog}
        />
        {task.subtasks.length !== 0 ? (
          <Collapse in={open} timeout="auto" className={classes.root}>
            <List>
              {task.subtasks.map(taskId => (
                <TaskRow
                  key={taskId}
                  deleteTask={deleteSubTask}
                  setTasks={setTasks}
                  setTask={setTask}
                  classes={classes}
                  task={tasks[taskId]}
                  tasks={tasks}
                />
              ))}
            </List>
          </Collapse>
        ) : (
          <></>
        )}
      </Grid>
    </ListItem>
  );
}

export default withStyles(styles, { withTheme: true })(TaskRow);
