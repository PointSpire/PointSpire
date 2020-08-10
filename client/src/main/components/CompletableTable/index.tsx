import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { useHistory } from 'react-router-dom';
import SortInput from './SortInput';
import sortingFunctions from '../../utils/sortingFunctions';
import CompletableRow from './CompletableRow';
import FilterButton from './FilterButton';
import HiddenItemsCaption from './HiddenItemsCaption';
import Completables, { CompletableType } from '../../models/Completables';
import User from '../../models/User';

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
    tableOptions: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    bottomArea: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      marginTop: theme.spacing(2),
    },
  });
}

export interface CompletableTableProps extends WithStyles<typeof styles> {
  rootCompletableType?: CompletableType;
  rootCompletableId?: string;
}

/**
 * Represents the complete table of projects in the UI, as well as modification
 * components such as sorting and project addition buttons.
 *
 * @param {CompletableTableProps} props the props
 */
function CompletableTable(props: CompletableTableProps) {
  const { rootCompletableId, rootCompletableType, classes } = props;

  // The type of completables in the table
  const completablesType =
    rootCompletableType && rootCompletableId ? 'task' : 'project';

  // Returns the ids of the completables in the table
  function getCompletableIds() {
    if (rootCompletableType && rootCompletableId) {
      return Completables.get(rootCompletableType, rootCompletableId).subtasks;
    }
    return User.get().projects;
  }

  const [completableIds, setCompletableIds] = useState([
    ...getCompletableIds(),
  ]);

  const [sortBy, setSortBy] = useState('priority');

  const history = useHistory();

  const listenerId = `CompletableTable`;

  /**
   * Removes all of the listeners for the completables on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    completableIds.forEach(completableId => {
      Completables.removePropertyListener(
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
    Completables.addPropertyListener(
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
      Completables.delete(completablesType, completableId);

      if (rootCompletableType && rootCompletableId) {
        // Set this completables subtasks info on ClientData which triggers state
        const updatedCompletable = Completables.get(
          rootCompletableType,
          rootCompletableId
        );
        updatedCompletable.subtasks.splice(
          updatedCompletable.subtasks.indexOf(completableId),
          1
        );
        Completables.setAndSave(rootCompletableType, updatedCompletable);
      }
    };
  }

  /**
   * Subscribe to changes in the completables array on the user.
   */
  useEffect(() => {
    if (rootCompletableType && rootCompletableId) {
      Completables.addListener(
        rootCompletableType,
        rootCompletableId,
        listenerId,
        () => {
          const newCompletables = [...getCompletableIds()];
          setCompletableIds(newCompletables);
        }
      );
    } else {
      User.addPropertyListener(listenerId, 'projects', () => {
        const newCompletables = [...getCompletableIds()];
        setCompletableIds(newCompletables);
      });
    }

    return function cleanup() {
      if (rootCompletableType && rootCompletableId) {
        Completables.removeListener(
          rootCompletableType,
          rootCompletableId,
          listenerId
        );
      } else {
        User.removePropertyListener('projects', listenerId);
      }
    };
  }, []);

  /**
   * Subscribe to changes in the children for sorting purposes.
   */
  useEffect(() => {
    addSortByListeners(sortBy);

    // This will be ran when the component is unmounted
    return function cleanup() {
      removeSortByListeners();
    };
  }, []);

  // #region [rgba(0, 205, 30, 0.1)] Filtering
  const [hiddenCompletableIds, setHiddenCompletableIds] = useState<
    Array<string>
  >([]);

  /**
   * Subscribe to changes in the filters.
   */
  useEffect(() => {
    User.addPropertyListener(listenerId, 'filters', () => {
      setHiddenCompletableIds([]);
      // TODO: This could be an issue because it will capture the state when this property listener is called
      setCompletableIds([...completableIds]);
    });

    return () => {
      User.removePropertyListener('filters', listenerId);
    };
  }, []);

  /**
   * Hides the given completable completely (no breadcrumb).
   *
   * @param {string} completableId the ID of the completable to hide
   */
  function hideCompletable(completableId: string) {
    hiddenCompletableIds.push(completableId);
    setHiddenCompletableIds([...hiddenCompletableIds]);
  }
  // #endregion

  /**
   * Adds a new project with a default title.
   */
  function addCompletable(): void {
    let newCompletable;

    if (rootCompletableType && rootCompletableId) {
      newCompletable = Completables.addTask(
        rootCompletableType,
        rootCompletableId,
        'Untitled'
      );
      history.push(`/c/task/${newCompletable._id}`);
    } else {
      newCompletable = Completables.addProject('Untitled');
      history.push(`/c/project/${newCompletable._id}`);
    }
    // Add the sorting listener
    addSortByListener(newCompletable._id, sortBy);
  }

  return (
    <>
      <div className={classes.tableOptions}>
        <SortInput
          className={classes.sortInput}
          sortBy={sortBy}
          setSortBy={updateSortBy}
        />
        <FilterButton />
      </div>

      <div className={classes.root}>
        {completableIds
          .sort(sortingFunctions[sortBy].function(completablesType))
          .map(completableId =>
            hiddenCompletableIds.includes(completableId) ? (
              ''
            ) : (
              <CompletableRow
                deleteThisCompletable={deleteCompletable(completableId)}
                completableType={completablesType}
                key={completableId}
                completableId={completableId}
                hideCompletable={hideCompletable}
              />
            )
          )}
      </div>
      <div className={classes.bottomArea}>
        <HiddenItemsCaption
          completableType="project"
          numHiddenItems={hiddenCompletableIds.length}
        />
        <Button
          className={classes.addProjectButton}
          variant="outlined"
          onClick={addCompletable}
        >
          {completablesType === 'task' ? 'Add Task' : 'Add Project'}
        </Button>
      </div>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(CompletableTable);
