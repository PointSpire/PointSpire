import React, { useState, useEffect } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Grid,
  Card,
  Collapse,
  Typography,
} from '@material-ui/core';
import { CompletableType } from '../../utils/dbTypes';
import { postNewTask, deleteTaskById } from '../../utils/fetchMethods';
import NoteInput from './NoteInput';
import DateInput from './DateInput';
import SimpleTextInput from '../SimpleTextInput';
import TaskMenu from '../TaskMenu';
import sortingFunctions from '../../utils/sortingFunctions';
import PriorityButton from '../PriorityButton';
import TaskExpanderButton from './TaskExpanderButton';
import NoteButton from './NoteButton';
import CompletedCheckbox from './CompletedCheckbox';
import UserData from '../../clientData/UserData';
import TagRow from '../TagRow';
import isFiltered from '../../utils/filterFunctions';
import HiddenItemsCaption from '../HiddenItemsCaption';

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
    breadCrumbRoot: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',

      // Tighten up the spacing between the breadcrumb and the first subtask
      marginBottom: theme.spacing(-2),
    },
    breadCrumb: {
      textAlign: 'left',
      marginLeft: theme.spacing(1),
    },
    hiddenItemsCaption: {
      marginTop: theme.spacing(2),

      // Make it so that the margin doesn't collapse
      display: 'block',
    },
  });
}

export interface CompletableRowProps extends WithStyles<typeof styles> {
  completableType: CompletableType;
  completableId: string;
  deleteThisCompletable: () => void;

  /**
   * Used to hide this project when all children have indicated that they
   * need to be hidden as well.
   */
  hideThisCompletable: () => void;
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
    hideThisCompletable,
  } = props;

  const [sortBy, setSortBy] = useState('priority');
  const [subTasksOpen, setSubTasksOpen] = useState(false);
  const [noteOpen, setNoteOpen] = useState(
    UserData.getUser().settings.notesExpanded
  );
  const [completable, setCompletable] = useState(
    UserData.getCompletable(completableType, completableId)
  );

  const listenerId = `${completableId}.CompletableRow`;

  /**
   * Removes all of the listeners for the subTasks on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    completable.subtasks.forEach(taskId => {
      UserData.removeCompletablePropertyListener(
        'task',
        taskId,
        listenerId,
        sortBy
      );
    });
  }

  function addSortByListener(taskId: string, updatedSortBy: string) {
    UserData.addCompletablePropertyListener(
      'task',
      taskId,
      listenerId,
      updatedSortBy,
      () => {
        const newCompletable = { ...completable };
        setCompletable(newCompletable);
      }
    );
  }

  /**
   * Adds listeners to all of the tasks for the completable on the property
   * indicated by the `updatedSortBy` variable.
   *
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListeners(updatedSortBy: string) {
    completable.subtasks.forEach(taskId => {
      addSortByListener(taskId, updatedSortBy);
    });
  }

  /**
   * Updates the `sortBy` prop so that the appropriate listeners are removed
   * and re-added to the subtasks of the completableRow.
   *
   * @param {string} updatedSortBy the updated sortBy value which should match
   * one of the available properties on the sortingFunctions object
   */
  function updateSortBy(updatedSortBy: string) {
    // Skip the update if they are the same
    if (updatedSortBy !== sortBy) {
      removeSortByListeners();
      setSortBy(updatedSortBy);
      addSortByListeners(updatedSortBy);
    }
  }

  // #region [rgba(0, 205, 30, 0.1)] Filtering
  const [thisIsFiltered, setThisIsFiltered] = useState(
    isFiltered(completableType, completableId)
  );
  const [hiddenSubtaskIds, setHiddenSubtaskIds] = useState<Array<string>>([]);

  /**
   * Hide this completable if it has no children and it is filtered. Otherwise,
   * if this completable is filtered and it has children, then expand the
   * subtasks.
   *
   * This only runs once on mount because hiding is handled by listeners later.
   */
  useEffect(() => {
    if (thisIsFiltered && completable.subtasks.length === 0) {
      hideThisCompletable();
    } else if (thisIsFiltered) {
      setSubTasksOpen(true);
    }
  }, []);

  function checkAndSetFiltered() {
    const shouldBeFiltered = isFiltered(completableType, completableId);
    if (
      shouldBeFiltered &&
      hiddenSubtaskIds.length === completable.subtasks.length
    ) {
      hideThisCompletable();
    } else if (shouldBeFiltered) {
      setSubTasksOpen(true);
    }
    setThisIsFiltered(shouldBeFiltered);
  }

  /**
   * Subscribe to changes that might cause this completable to become filtered.
   */
  useEffect(() => {
    UserData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      'startDate',
      () => {
        checkAndSetFiltered();
      }
    );

    UserData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      'completed',
      () => {
        checkAndSetFiltered();
      }
    );

    return () => {
      UserData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        'startDate'
      );
      UserData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        'completed'
      );
    };
  }, []);

  /**
   * Subscribe to changes in the filters.
   */
  useEffect(() => {
    UserData.addUserPropertyListener(listenerId, 'filters', () => {
      // Check if this completable should be hidden again
      const thisShouldBeFiltered = isFiltered(completableType, completableId);
      if (
        completable.subtasks.length === hiddenSubtaskIds.length &&
        thisShouldBeFiltered
      ) {
        hideThisCompletable();
      } else {
        // Set if this completable should be filtered
        setThisIsFiltered(thisShouldBeFiltered);

        // Clear the hidden subtasks
        setHiddenSubtaskIds([]);

        // Trigger a re-render
        setCompletable({
          ...UserData.getCompletable(completableType, completableId),
        });
      }
    });

    return () => {
      UserData.removeUserPropertyListener('filters', listenerId);
    };
  }, []);

  /**
   * Creates a function that will hide the subtask completely (no breadcrumb).
   * If all of the children of this completable should be hidden and this
   * completable is filtered, then it triggers the parent of this completable
   * to hide this completable.
   *
   * @param {string} subTaskId the ID of the subTask to hide
   */
  function hideSubTask(subTaskId: string) {
    return () => {
      hiddenSubtaskIds.push(subTaskId);
      if (
        hiddenSubtaskIds.length === completable.subtasks.length &&
        thisIsFiltered
      ) {
        hideThisCompletable();
      }
      setHiddenSubtaskIds([...hiddenSubtaskIds]);
    };
  }
  // #endregion

  /**
   * Subscribe to changes in the children for sorting purposes.
   */
  useEffect(() => {
    addSortByListeners(sortBy);

    // This will be ran when the compoennt is unmounted
    return function cleanup() {
      removeSortByListeners();
    };
  }, []);

  /**
   * Subscribes to changes of this completable. This should run once when the
   * component is mounted because of the empty array as the second argument.
   *
   * See also: https://reactjs.org/docs/hooks-effect.html#tip-optimizing-performance-by-skipping-effects
   */
  useEffect(() => {
    UserData.addCompletableListener(
      completableType,
      completableId,
      listenerId,
      updatedCompletable => {
        if (updatedCompletable !== null) {
          if (completable === updatedCompletable) {
            // eslint-disable-next-line
            console.log(
              'Caution: Completable did not re-render because ' +
                'it is equal to the updated completable. You may want to make ' +
                'sure that the updated completable is an entirely new object.'
            );
          }
          // eslint-disable-next-line
          console.log(
            'Completable with ID: ',
            updatedCompletable._id,
            ' updated'
          );
          setCompletable(updatedCompletable);
        }
      }
    );

    // This will be ran when the compoennt is unmounted
    return function cleanup() {
      UserData.removeCompletableListener(
        completableType,
        completableId,
        listenerId
      );
    };
  }, []);

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
    const tasks = UserData.getTasks();
    tasks[newTask._id] = newTask;
    UserData.setTasks(tasks);

    // Add the new sub task to the completable
    const updatedCompletable = { ...completable };
    updatedCompletable.subtasks.push(newTask._id);
    UserData.setAndSaveCompletable(completableType, updatedCompletable);

    // Set this completable as a listener of the new one
    addSortByListener(newTask._id, sortBy);

    // Open up the subtasks
    setSubTasksOpen(true);
  }

  /**
   * Generates a function that will delete the specified subtask in this
   * completables state, in the ClientData, and on the server.
   *
   * @param {string} taskId the ID of the task to delete
   */
  function deleteSubTask(taskId: string) {
    return async () => {
      // Delete the task from ClientData first
      UserData.deleteCompletable('task', taskId);

      // Set this completables subtasks info on ClientData which triggers state
      const updatedCompletable = { ...completable };
      updatedCompletable.subtasks.splice(
        completable.subtasks.indexOf(taskId),
        1
      );
      UserData.setAndSaveCompletable(completableType, updatedCompletable);

      // Make the request to delete the task
      await deleteTaskById(taskId);
    };
  }

  return (
    <>
      <div className={thisIsFiltered ? classes.breadCrumbRoot : classes.root}>
        <TaskExpanderButton
          open={subTasksOpen}
          setOpen={setSubTasksOpen}
          parent={completable}
        />
        {thisIsFiltered ? (
          <Typography variant="overline" className={classes.breadCrumb}>
            {completable.title}
          </Typography>
        ) : (
          <Card className={classes.card} raised key={completable._id}>
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
                    completableType={completableType}
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
                    completableType={completableType}
                    completableId={completableId}
                    completablePropertyName="title"
                  />
                </Grid>
                <Grid item>
                  <PriorityButton
                    completableType={completableType}
                    completableId={completableId}
                  />
                </Grid>
                <Grid item>
                  <DateInput
                    completablePropertyName="startDate"
                    completableId={completableId}
                    completableType={completableType}
                    label="Start Date"
                  />
                </Grid>
                <Grid item>
                  <DateInput
                    completablePropertyName="dueDate"
                    completableId={completableId}
                    completableType={completableType}
                    label="Due Date"
                  />
                </Grid>
                <Grid item>
                  <TaskMenu
                    sortBy={sortBy}
                    setSortBy={updateSortBy}
                    deleteTask={deleteThisCompletable}
                    addSubTask={addSubTask}
                  />
                </Grid>
              </Grid>
              <Grid container item className={classes.flexGrow}>
                <TagRow
                  completableType={completableType}
                  completableId={completableId}
                />
              </Grid>
              <Grid
                item
                className={classes.flexGrow}
                key={`${completable._id}.note`}
              >
                <Collapse in={noteOpen} timeout="auto">
                  <NoteInput
                    completableId={completableId}
                    completableType={completableType}
                    label="Note"
                  />
                </Collapse>
              </Grid>
            </Grid>
          </Card>
        )}
      </div>

      <div className={classes.nested}>
        <Collapse in={subTasksOpen} timeout="auto" className={classes.flexGrow}>
          {completable.subtasks
            .sort(sortingFunctions[sortBy].function('task'))
            .map(taskId => {
              return hiddenSubtaskIds.includes(taskId) ? (
                ''
              ) : (
                <CompletableRow
                  hideThisCompletable={hideSubTask(taskId)}
                  deleteThisCompletable={deleteSubTask(taskId)}
                  completableType="task"
                  key={taskId}
                  completableId={taskId}
                  classes={classes}
                />
              );
            })}
          <HiddenItemsCaption
            className={classes.hiddenItemsCaption}
            numHiddenItems={hiddenSubtaskIds.length}
            completableType="task"
          />
        </Collapse>
      </div>
    </>
  );
};

export default withStyles(styles, { withTheme: true })(CompletableRow);
