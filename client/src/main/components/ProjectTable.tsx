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

  const [sortBy, setSortBy] = useState('Priority');

  /**
   * Generates a function that will delete the specified project in the user
   * state, in the ClientData, and on the server.
   *
   * @param {string} projectId the ID of the project to delete
   */
  function deleteProject(projectId: string) {
    return async () => {
      // Delete the project from ClientData first
      ClientData.deleteCompletable('project', projectId);

      // Set the user state
      user.projects.splice(user.projects.indexOf(projectId), 1);
      setUser(user);

      // Make the request to delete the project
      await deleteProjectOnServer(projectId);
    };
  }

  const listenerId = `${user._id}.ProjectTable`;

  function arraysAreShallowEqual(
    a: Array<unknown>,
    b: Array<unknown>
  ): boolean {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (let i = 0; i < a.length; i += 1) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /**
   * Subscribe to changes in the children for sorting purposes.
   *
   * This could potentially be made more efficient by comparing to see if the
   * sorted array is different than the original array. Not sure if that is
   * more efficient than just pushing the change or not though.
   */
  useEffect(() => {
    user.projects.forEach(projectId => {
      ClientData.addCompletableListener(
        'project',
        projectId,
        listenerId,
        updatedCompletable => {
          if (updatedCompletable !== null) {
            const newUser = { ...user };
            newUser.projects.sort(sortingFunctions[sortBy]('project'));
            if (!arraysAreShallowEqual(newUser.projects, user.projects)) {
              // eslint-disable-next-line
              console.log('Arrays were not shallow equal');
              setUser(newUser);
            }
          }
        }
      );
    });

    // This will be ran when the compoennt is unmounted
    return function cleanup() {
      user.projects.forEach(projectId => {
        ClientData.removeCompletableListener('project', projectId, listenerId);
      });
    };
  }, []);

  /**
   * Adds a project to the server, to the user state and the to the ClientData.
   *
   * @param {string} projectTitle the title of the new project
   */
  async function addProject(): Promise<void> {
    const newProject = await postNewProject(user._id, 'Untitled');

    // Add to the ClientData
    const projects = ClientData.getProjects();
    projects[newProject._id] = newProject;
    ClientData.setProjects(projects);

    // Add the project table as a listener of the new project
    ClientData.addCompletableListener(
      'project',
      newProject._id,
      listenerId,
      updatedCompletable => {
        if (updatedCompletable !== null) {
          const newUser = { ...user };
          newUser.projects.sort(sortingFunctions[sortBy]('project'));
          setUser(newUser);
        }
      }
    );

    // Add it to the user state which will propogate the changes in the UI
    user.projects.push(newProject._id);
    setUser(user);
  }

  return (
    <>
      <SortInput
        className={classes.sortInput}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <div className={classes.root}>
        {user.projects
          .sort(sortingFunctions[sortBy]('project'))
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
