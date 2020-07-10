import React, { useState, useEffect } from 'react';
import { Button } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { User } from '../logic/dbTypes';
import { SetUserFunction } from '../App';
import {
  postNewProject,
  deleteProject as deleteProjectOnServer,
} from '../logic/fetchMethods';
import sortingFunctions from '../logic/sortingFunctions';
import SortInput from './SortInput';
import CompletableRow from './CompletableRow/CompletableRow';
import ClientData from '../logic/ClientData';
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

export interface ProjectTableProps extends WithStyles<typeof styles> {
  user: User;
  setUser: SetUserFunction;
}

export type ProjectTableState = unknown;

/**
 * Represents the complete table of projects in the UI, as well as modification
 * components such as sorting and project addition buttons.
 *
 * @param {ProjectTableProps} props the props
 */
function ProjectTable(props: ProjectTableProps) {
  const { user, setUser, classes } = props;
  const [sortBy, setSortBy] = useState('priority');

  const listenerId = `${user._id}.ProjectTable`;

  /**
   * Removes all of the listeners for the projects on the field indicated by
   * `sortBy`.
   */
  function removeSortByListeners() {
    user.projects.forEach(projectId => {
      ClientData.removeCompletablePropertyListener(
        'project',
        projectId,
        listenerId,
        sortBy
      );
    });
  }

  /**
   * Adds listers to all of the projects for the user on the property indicated
   * by the `updatedSortBy` variable.
   *
   * @param {string} updatedSortBy the property name that will be used to add
   * listeners
   */
  function addSortByListeners(updatedSortBy: string) {
    user.projects.forEach(projectId => {
      ClientData.addCompletablePropertyListener(
        'project',
        projectId,
        listenerId,
        updatedSortBy,
        () => {
          const newUser = { ...user };
          setUser(newUser);
        }
      );
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
    // eslint-disable-next-line
    console.log('triggered updateSortBy');
    // Skip the update if they are the same
    if (updatedSortBy !== sortBy) {
      removeSortByListeners();
      setSortBy(updatedSortBy);
      addSortByListeners(updatedSortBy);
    }
  }

  /**
   * Generates a function that will delete the specified project in the user
   * state, in the ClientData, and on the server.
   *
   * @param {string} projectId the ID of the project to delete
   */
  function deleteProject(projectId: string) {
    return async () => {
      // Delete the project from ClientData first. Listeners do not need to be
      // deleted because deleting the completable removes all listeners.
      ClientData.deleteCompletable('project', projectId);

      // Set the user state
      user.projects.splice(user.projects.indexOf(projectId), 1);
      setUser(user);

      // Make the request to delete the project
      await deleteProjectOnServer(projectId);
    };
  }

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
   * Adds a project to the server, to the user state and the ClientData.
   *
   * @param {string} projectTitle the title of the new project
   */
  async function addProject(): Promise<void> {
    const newProject = await postNewProject(user._id, 'Untitled');

    // Add to the ClientData
    const projects = ClientData.getProjects();
    projects[newProject._id] = newProject;
    ClientData.setProjects(projects);

    // Add the project table as a listener of the new project for sorting
    ClientData.addCompletableListener(
      'project',
      newProject._id,
      listenerId,
      updatedCompletable => {
        if (updatedCompletable !== null) {
          const newUser = { ...user };
          newUser.projects.sort(sortingFunctions[sortBy].function('project'));
          setUser(newUser);
        }
      }
    );

    // Add project to the user state which will propogate the changes in the UI
    user.projects.push(newProject._id);
    setUser(user);
  }

  return (
    <>
      <SortInput
        className={classes.sortInput}
        sortBy={sortBy}
        setSortBy={updateSortBy}
      />
      <div className={classes.root}>
        {user.projects
          .sort(sortingFunctions[sortBy].function('project'))
          .map(projectId => (
            <CompletableRow
              settings={user.settings}
              deleteThisCompletable={deleteProject(projectId)}
              completableType="project"
              key={projectId}
              completableId={projectId}
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
