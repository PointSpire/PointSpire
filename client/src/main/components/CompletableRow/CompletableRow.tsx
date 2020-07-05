import React, { useState, useEffect } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Grid,
  Card,
  Collapse,
} from '@material-ui/core';
import { UserSettings, Completable } from '../../logic/dbTypes';
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
import ClientData from '../../logic/ClientData';

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
  completableId: string;
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
    completableId,
    completableType,
    classes,
    deleteThisCompletable,
    settings,
  } = props;

  const [sortBy, setSortBy] = useState('Priority');
  const [subTasksOpen, setSubTasksOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(settings.notesExpanded);
  const [completable, setCompletable] = useState(
    ClientData.getCompletable(completableType, completableId)
  );

  /**
   * Subscribes to changes of this completable. This should run once when the
   * component is mounted.
   */
  useEffect(() => {
    const listenerId = `${completableId}.CompletableRow`;
    ClientData.addCompletableListener(
      completableType,
      completableId,
      listenerId,
      updatedCompletable => {
        // eslint-disable-next-line
        console.log('listenerCallback was triggered');
        if (updatedCompletable !== null) {
          setCompletable(updatedCompletable);
        }
      }
    );

    // This will be ran when the compoennt is unmounted
    return function cleanup() {
      ClientData.removeCompletableListener(
        'project',
        completableId,
        listenerId
      );
    };
  });

  /**
   * Saves the completable to the server and logs to the console what
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
   * Sets the provided copmletable to ClientData which triggers the state,
   * and schedules it to be saved on the server.
   *
   * @param {Completable} updatedCompletable the updated completable to use
   */
  function setAndScheduleSave(updatedCompletable: Completable): void {
    // eslint-disable-next-line
    console.log('setAndScheduleSave was triggered');
    ClientData.setCompletable(completableType, updatedCompletable);
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
   * Adds a new task to this completable on the server and in ClientData which
   * triggers state.
   *
   * @param {string} newTitle the title of the new task
   */
  async function addSubTask(newTitle: string): Promise<void> {
    // Make the request for the new task
    const newTask = await postNewTask(completableType, completableId, newTitle);

    // Add the new task to the task objects
    const tasks = ClientData.getTasks();
    tasks[newTask._id] = newTask;
    ClientData.setTasks(tasks);

    // Add the new sub task to the completable
    completable.subtasks.push(newTask._id);
    ClientData.setCompletable(completableType, completable);
  }

  /**
   * Generates a function that will delete the specified subtask in this
   * completables state, in the ClientData, and on the server.
   *
   * @param {string} taskId the ID of the task to delete
   */
  function deleteSubTask(taskId: string) {
    return async () => {
      const taskToDelete = ClientData.getCompletable('task', taskId);

      // Delete the task from ClientData first
      ClientData.deleteCompletable('task', taskId);

      // Set this completables subtasks info on ClientData which triggers state
      completable.subtasks.splice(completable.subtasks.indexOf(taskId), 1);
      ClientData.setCompletable(completableType, completable);

      // Make the request to delete the project
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
          {completable.subtasks
            .sort(sortingFunctions[sortBy]('task'))
            .map(taskId => (
              <CompletableRow
                settings={settings}
                deleteThisCompletable={deleteSubTask(taskId)}
                completableType="task"
                key={taskId}
                completableId={taskId}
                classes={classes}
              />
            ))}
        </Collapse>
      </div>
    </>
  );
};

export default withStyles(styles, { withTheme: true })(CompletableRow);
