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
    ...ClientData.getUser().projects,
  ]);
  const [sortBy, setSortBy] = useState('priority');

  const listenerId = `ProjectTable`;

  /**
   * Removes all of the listeners for the projects on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    projectIds.forEach(projectId => {
      ClientData.removeCompletablePropertyListener(
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
    ClientData.addCompletablePropertyListener(
      'project',
      projectId,
      listenerId,
      updatedSortBy,
      () => {
        // Simply trigger a re-render so it re-sorts the projects list
        const newProjects = [...ClientData.getUser().projects];
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
      ClientData.deleteCompletable('project', projectId);
    };
  }

  /**
   * Subscribe to changes in the projects array on the user.
   */
  useEffect(() => {
    ClientData.addUserPropertyListener(listenerId, 'projects', () => {
      const newProjects = [...ClientData.getUser().projects];
      setProjectIds(newProjects);
    });

    return function cleanup() {
      ClientData.removeUserPropertyListener('projects', listenerId);
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
  async function addProject(): Promise<void> {
    const newProject = await ClientData.addProject('Untitled');

    // Add the sorting listener
    addSortByListener(newProject._id, sortBy);
  }

  return (
    <>
      <SortInput
        className={classes.sortInput}
        sortBy={sortBy}
        setSortBy={updateSortBy}
      />
      <div className={classes.root}>
        {projectIds
          .sort(sortingFunctions[sortBy].function('project'))
          .map(projectId => (
            <CompletableRow
              deleteThisCompletable={deleteProject(projectId)}
              completableType="project"
              key={projectId}
              completableId={projectId}
              mobile
            />
          ))}
      </div>
      <Button
        className={classes.addProjectButton}
        variant="outlined"
        onClick={addProject}
      >
        Add Project
      </Button>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
