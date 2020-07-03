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
import { Project, TaskObjects, Task, UserSettings } from '../../logic/dbTypes';
import {
  SetTaskFunction,
  SetTasksFunction,
  SetProjectFunction,
} from '../../App';
import {
  postNewTask,
  deleteTask,
  patchProject,
  patchTask,
} from '../../logic/fetchMethods';
import scheduleCallback from '../../logic/savingTimer';
import NoteInput from './NoteInput';
import DateInput from './DateInput';
import SimpleTextInput from '../SimpleTextInput';
import TaskMenu from '../TaskMenu/TaskMenu';
import sortingFunctions from '../../logic/sortingFunctions';
import PriorityButton from '../PriorityButton/PriorityButton';
import TaskExpanderButton from './TaskExpanderButton';
import NoteButton from './NoteButton';
import CompletedCheckbox from './CompletedCheckbox';

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
    checkbox: {
      paddingRight: 0,
    },
  });
}

export interface CompletableRowProps extends WithStyles<typeof styles> {
  completableType: 'project' | 'task';
  completable: Project | Task;
  tasks: TaskObjects;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  setProject: SetProjectFunction;
  settings: UserSettings;
  deleteThisCompletable: () => Promise<void>;
}

/**
 * Represents a row for either a Project or a Task.
 *
 * @param {CompletableRowProps} props the props
 */
const CompletableRow = (props: CompletableRowProps) => {
  const {
    completableType,
    completable,
    classes,
    tasks,
    setTask,
    setTasks,
    setProject,
    deleteThisCompletable,
    settings,
  } = props;

  const [sortBy, setSortBy] = useState('Priority');
  const [subTasksOpen, setSubTasksOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(settings.notesExpanded);

  // Setup single conditional to define setting the completable in state
  let setCompletable: {
    (updatedProject: Task): void;
    (updatedTask: Task): void;
  };
  if (completableType === 'project') {
    setCompletable = setProject;
  } else {
    setCompletable = setTask;
  }

  /**
   * Saves the completable in state to the server and logs to the console what
   * happened.
   */
  function saveCompletable(): void {
    let patchCompletable;
    if (completableType === 'project') {
      patchCompletable = patchProject;
    } else {
      patchCompletable = patchTask;
    }
    patchCompletable(completable)
      .then(result => {
        if (result) {
          // eslint-disable-next-line
          console.log(
            `${completableType} with ID: ${completable._id} was ` +
              `successfully saved to the server`
          );
        } else {
          // eslint-disable-next-line
          console.log(
            `${completableType} with ID: ${completable._id} failed ` +
              `to save to the server`
          );
        }
      })
      .catch(err => {
        // eslint-disable-next-line
        console.error(err);
      });
  }

  /**
   * Sets the provided copmletable to state, and schedules it to be saved on
   * the server.
   *
   * @param {Project | Task} updatedCompletable the updated completable to use
   */
  function setAndScheduleSave(updatedCompletable: Task | Project): void {
    setCompletable(updatedCompletable);
    scheduleCallback(
      `${updatedCompletable._id}.saveCompletable`,
      saveCompletable
    );
  }

  function saveDueDate(newDate: Date | null): void {
    completable.dueDate = newDate;
    setAndScheduleSave(completable);
  }

  function saveStartDate(newDate: Date | null): void {
    completable.startDate = newDate;
    setAndScheduleSave(completable);
  }

  function savePriority(newPriority: number): void {
    completable.priority = newPriority;
    setAndScheduleSave(completable);
  }

  /**
   * Generates a function which can be used to modify the specified `property`
   * of the completable and schedule it to be saved on the server.
   *
   * @param {'note' | 'title'} property the property to modify on the
   * completable state
   * @returns {(newText: string) => void} the function which can be used to
   * save the specified `property` as long as the property is a string type
   */
  function saveText(property: 'note' | 'title') {
    return (newText: string): void => {
      completable[property] = newText;
      setAndScheduleSave(completable);
    };
  }

  /**
   * Adds a new task to this completable on the server and in state.
   *
   * @param {string} newTitle the title of the new task
   */
  async function addSubTask(newTitle: string): Promise<void> {
    // Make the request for the new task
    const newTask = await postNewTask(
      completableType,
      completable._id,
      newTitle
    );

    // Add the new task to the task objects
    tasks[newTask._id] = newTask;
    setTasks(tasks);

    // Add the new task to the completable
    completable.subtasks.push(newTask._id);
    setCompletable(completable);
  }

  /**
   * Generates a function that deletes the given task from state and from the
   * server.
   *
   * @param {Task} task the task to delete
   */
  function deleteSubTask(taskToDelete: Task) {
    return async () => {
      // Delete the task from state first
      delete tasks[taskToDelete._id];
      setTasks(tasks);
      completable.subtasks.splice(
        completable.subtasks.indexOf(taskToDelete._id),
        1
      );
      setCompletable(completable);

      // Make the request to delete the task
      await deleteTask(taskToDelete);
    };
  }

  return (
    <>
      <div className={classes.root}>
        <TaskExpanderButton
          open={subTasksOpen}
          setOpen={setSubTasksOpen}
          parent={completable}
        />
        <Card className={`${classes.card}`} raised key={completable._id}>
          <Grid container justify="flex-start" alignItems="center">
            <Grid
              container
              spacing={2}
              wrap="nowrap"
              alignItems="center"
              justify="flex-start"
            >
              <Grid item>
                <CompletedCheckbox
                  setAndScheduleSave={setAndScheduleSave}
                  className={classes.checkbox}
                  completable={completable}
                />
              </Grid>
              <Grid item>
                <NoteButton
                  noteIsEmpty={
                    !completable.note || completable.note.length === 0
                  }
                  setNoteOpen={setNoteOpen}
                  noteOpen={noteOpen}
                />
              </Grid>
              <Grid
                item
                className={classes.root}
                key={`${completable._id}.title`}
              >
                <SimpleTextInput
                  label={
                    completableType === 'project'
                      ? 'Project Title'
                      : 'Task Title'
                  }
                  value={completable.title}
                  saveValue={saveText('title')}
                />
              </Grid>
              <Grid item>
                <PriorityButton
                  savePriority={savePriority}
                  priority={completable.priority}
                  projectOrTaskTitle={completable.title}
                />
              </Grid>
              <Grid item>
                <DateInput
                  label="Start Date"
                  date={completable.startDate}
                  saveDate={saveStartDate}
                />
              </Grid>
              <Grid item>
                <DateInput
                  label="Due Date"
                  date={completable.dueDate}
                  saveDate={saveDueDate}
                />
              </Grid>
              <Grid item>
                <TaskMenu
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  deleteTask={deleteThisCompletable}
                  addSubTask={addSubTask}
                />
              </Grid>
            </Grid>

            <Grid
              item
              className={classes.flexGrow}
              key={`${completable._id}.note`}
            >
              <Collapse in={noteOpen} timeout="auto">
                <NoteInput
                  saveNote={saveText('note')}
                  note={completable.note}
                  label="Note"
                />
              </Collapse>
            </Grid>
          </Grid>
        </Card>
      </div>
      <div className={classes.nested}>
        <Collapse in={subTasksOpen} timeout="auto" className={classes.flexGrow}>
          {Object.values(tasks)
            .filter(task => completable.subtasks.includes(task._id))
            .sort(sortingFunctions[sortBy])
            .map(task => (
              <CompletableRow
                classes={classes}
                settings={settings}
                setProject={setProject}
                key={task._id}
                setTasks={setTasks}
                setTask={setTask}
                completable={task}
                completableType="task"
                tasks={tasks}
                deleteThisCompletable={deleteSubTask(task)}
              />
            ))}
        </Collapse>
      </div>
    </>
  );
};

export default withStyles(styles, { withTheme: true })(CompletableRow);
