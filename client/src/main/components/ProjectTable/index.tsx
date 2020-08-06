import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import sortingFunctions from '../../utils/sortingFunctions';
import SortInput from './SortInput';
import CompletableRow from './CompletableRow';
import FilterButton from './FilterButton';
import HiddenItemsCaption from './HiddenItemsCaption';
import UserData from '../../clientData/UserData';
// import arraysAreShallowEqual from '../logic/comparisonFunctions';

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

export type ProjectTableProps = WithStyles<typeof styles>;

export type ProjectTableState = unknown;

/**
 * Represents the complete table of projects in the UI, as well as modification
 * components such as sorting and project addition buttons.
 *
 * @param {ProjectTableProps} props the props
 */
function ProjectTable(props: ProjectTableProps) {
  const { classes } = props;
  const [projectIds, setProjectIds] = useState([
    ...UserData.getUser().projects,
  ]);
  const [sortBy, setSortBy] = useState('priority');

  const listenerId = `ProjectTable`;

  /**
   * Removes all of the listeners for the projects on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    projectIds.forEach(projectId => {
      UserData.removeCompletablePropertyListener(
        'project',
        projectId,
        listenerId,
        sortBy
      );
    });
  }

  /**
   * Adds a single listener to the project with the given ID on the property
   * indicated by `updatedSortBy`.
   *
   * @param {string} projectId the ID of the project
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListener(projectId: string, updatedSortBy: string) {
    UserData.addCompletablePropertyListener(
      'project',
      projectId,
      listenerId,
      updatedSortBy,
      () => {
        // Simply trigger a re-render so it re-sorts the projects list
        const newProjects = [...UserData.getUser().projects];
        setProjectIds(newProjects);
      }
    );
  }

  /**
   * Adds listeners to all of the projects for the user on the property
   * indicated by the `updatedSortBy` variable.
   *
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListeners(updatedSortBy: string) {
    projectIds.forEach(projectId => {
      addSortByListener(projectId, updatedSortBy);
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
   * @param {string} projectId the ID of the project to delete
   */
  function deleteProject(projectId: string) {
    return () => {
      // Delete the project from ClientData. Listeners do not need to be
      // deleted because deleting the completable removes all listeners.
      UserData.deleteCompletable('project', projectId);
    };
  }

  /**
   * Subscribe to changes in the projects array on the user.
   */
  useEffect(() => {
    UserData.addUserPropertyListener(listenerId, 'projects', () => {
      const newProjects = [...UserData.getUser().projects];
      setProjectIds(newProjects);
    });

    return function cleanup() {
      UserData.removeUserPropertyListener('projects', listenerId);
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
  const [hiddenProjectIds, setHiddenProjectIds] = useState<Array<string>>([]);

  /**
   * Subscribe to changes in the filters.
   */
  useEffect(() => {
    UserData.addUserPropertyListener(listenerId, 'filters', () => {
      setHiddenProjectIds([]);
      setProjectIds([...projectIds]);
    });

    return () => {
      UserData.removeUserPropertyListener('filters', listenerId);
    };
  }, []);

  /**
   * Hides the given project completely (no breadcrumb).
   *
   * @param {string} projectId the ID of the project to hide
   */
  function hideProject(projectId: string) {
    hiddenProjectIds.push(projectId);
    setHiddenProjectIds([...hiddenProjectIds]);
  }
  // #endregion

  /**
   * Adds a new project with a default title.
   */
  function addProject(): void {
    const newProject = UserData.addProject('Untitled');

    // Add the sorting listener
    addSortByListener(newProject._id, sortBy);
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
        {projectIds
          .sort(sortingFunctions[sortBy].function('project'))
          .map(projectId =>
            hiddenProjectIds.includes(projectId) ? (
              ''
            ) : (
              <CompletableRow
                hideCompletable={hideProject}
                deleteThisCompletable={deleteProject(projectId)}
                completableType="project"
                key={projectId}
                completableId={projectId}
              />
            )
          )}
      </div>
      <div className={classes.bottomArea}>
        <HiddenItemsCaption
          completableType="project"
          numHiddenItems={hiddenProjectIds.length}
        />
        <Button
          className={classes.addProjectButton}
          variant="outlined"
          onClick={addProject}
        >
          Add Project
        </Button>
      </div>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
