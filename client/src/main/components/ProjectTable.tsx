import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import sortingFunctions from '../logic/sortingFunctions';
import SortInput from './SortInput';
import CompletableRow from './CompletableRow/CompletableRow';
import ClientData from '../logic/ClientData/ClientData';
import { CompletableType } from '../logic/dbTypes';
import { postNewTask } from '../logic/fetchMethods';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      alignItems: 'center',
      flexGrow: 1,
    },
    addProjectButton: {
      alignSelf: 'center',
      background: theme.palette.primary.main,
      margin: theme.spacing(1),
    },
    sortInput: {
      display: 'flex',
      marginTop: theme.spacing(1),
      marginBottom: theme.spacing(1),
      marginLeft: theme.spacing(3),
    },
  });
}

export interface ProjectTableProps extends WithStyles<typeof styles> {
  rootCompletableType?: CompletableType;
  rootCompletableId?: string;
}

export type ProjectTableState = unknown;

/**
 * Represents the complete table of projects in the UI, as well as modification
 * components such as sorting and project addition buttons.
 *
 * @param {ProjectTableProps} props the props
 */
function ProjectTable(props: ProjectTableProps) {
  const { rootCompletableId, rootCompletableType, classes } = props;

  // The type of completables in the table
  const completablesType =
    rootCompletableType && rootCompletableId ? 'task' : 'project';

  // Returns the ids of the completables in the table
  function getCompletableIds() {
    if (rootCompletableType && rootCompletableId) {
      return ClientData.getCompletable(rootCompletableType, rootCompletableId)
        .subtasks;
    }
    return ClientData.getUser().projects;
  }

  const [completableIds, setCompletableIds] = useState([
    ...getCompletableIds(),
  ]);

  const [sortBy, setSortBy] = useState('priority');

  const listenerId = `CompletableTable`;

  /**
   * Removes all of the listeners for the completables on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    completableIds.forEach(completableId => {
      ClientData.removeCompletablePropertyListener(
        completablesType,
        completableId,
        listenerId,
        sortBy
      );
    });
  }

  /**
   * Adds a single listener to the project with the given ID on the property
   * indicated by `updatedSortBy`.
   *
   * @param {string} completableId the ID of the completable
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListener(completableId: string, updatedSortBy: string) {
    ClientData.addCompletablePropertyListener(
      completablesType,
      completableId,
      listenerId,
      updatedSortBy,
      () => {
        // Simply trigger a re-render so it re-sorts the projects list
        const newCompletables = [...getCompletableIds()];
        setCompletableIds(newCompletables);
      }
    );
  }

  /**
   * Adds listeners to all of the completables for the user | project on the property
   * indicated by the `updatedSortBy` variable.
   *
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListeners(updatedSortBy: string) {
    completableIds.forEach(completableId => {
      addSortByListener(completableId, updatedSortBy);
    });
  }

  /**
   * Updates the `sortBy` prop so that the appropriate listeners are removed
   * and re-added to the project table.
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

  /**
   * Generates a function that will delete the specified project.
   *
   * @param {string} completableId the ID of the project to delete
   */
  function deleteCompletable(completableId: string) {
    return () => {
      // Delete the project from ClientData. Listeners do not need to be
      // deleted because deleting the completable removes all listeners.
      ClientData.deleteCompletable(completablesType, completableId);

      if (rootCompletableType && rootCompletableId) {
        // Set this completables subtasks info on ClientData which triggers state
        const updatedCompletable = ClientData.getCompletable(
          rootCompletableType,
          rootCompletableId
        );
        updatedCompletable.subtasks.splice(
          updatedCompletable.subtasks.indexOf(completableId),
          1
        );
        ClientData.setAndSaveCompletable(
          rootCompletableType,
          updatedCompletable
        );
      }
    };
  }

  /**
   * Subscribe to changes in the completables array on the user.
   */
  useEffect(() => {
    if (rootCompletableType && rootCompletableId) {
      ClientData.addCompletableListener(
        rootCompletableType,
        rootCompletableId,
        listenerId,
        () => {
          const newCompletables = [...getCompletableIds()];
          setCompletableIds(newCompletables);
        }
      );
    } else {
      ClientData.addUserPropertyListener(listenerId, 'projects', () => {
        const newCompletables = [...getCompletableIds()];
        setCompletableIds(newCompletables);
      });
    }

    return function cleanup() {
      if (rootCompletableType && rootCompletableId) {
        ClientData.removeCompletableListener(
          rootCompletableType,
          rootCompletableId,
          listenerId
        );
      } else {
        ClientData.removeUserPropertyListener('projects', listenerId);
      }
    };
  }, []);

  /**
   * Subscribe to changes in the children for sorting purposes.
   *
   * This could potentially be made more efficient by comparing to see if the
   * sorted array is different than the original array. Not sure if that is
   * more efficient than just pushing the change or not though.
   */
  useEffect(() => {
    addSortByListeners(sortBy);

    // This will be ran when the component is unmounted
    return function cleanup() {
      removeSortByListeners();
    };
  }, []);

  /**
   * Adds a new project with a default title.
   */
  async function addCompletable(): Promise<void> {
    let newCompletable;

    if (rootCompletableType && rootCompletableId) {
      // Make the request for the new task
      newCompletable = await postNewTask(
        rootCompletableType,
        rootCompletableId,
        'Untitled'
      );

      // Add the new task to the task objects
      const tasks = ClientData.getTasks();
      tasks[newCompletable._id] = newCompletable;
      ClientData.setTasks(tasks);

      // Add the new sub task to the completable
      const updatedCompletable = ClientData.getCompletable(
        rootCompletableType,
        rootCompletableId
      );
      updatedCompletable.subtasks.push(newCompletable._id);
      ClientData.setAndSaveCompletable(rootCompletableType, updatedCompletable);

      // Set this completable as a listener of the new one
      addSortByListener(newCompletable._id, sortBy);
    } else {
      newCompletable = await ClientData.addProject('Untitled');
    }
    // Add the sorting listener
    addSortByListener(newCompletable._id, sortBy);
  }

  return (
    <>
      <SortInput
        className={classes.sortInput}
        sortBy={sortBy}
        setSortBy={updateSortBy}
      />
      <div className={classes.root}>
        {completableIds
          .sort(sortingFunctions[sortBy].function(completablesType))
          .map(completableId => (
            <CompletableRow
              deleteThisCompletable={deleteCompletable(completableId)}
              completableType={completablesType}
              key={completableId}
              completableId={completableId}
            />
          ))}
      </div>
      <Button
        className={classes.addProjectButton}
        variant="outlined"
        onClick={addCompletable}
      >
        {completablesType === 'task' ? 'Add Task' : 'Add Project'}
      </Button>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
