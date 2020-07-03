import React, { useState } from 'react';
import { Button } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { ProjectObjects, TaskObjects, Project, User } from '../logic/dbTypes';
import {
  SetProjectsFunction,
  SetProjectFunction,
  SetUserFunction,
  SetTaskFunction,
  SetTasksFunction,
} from '../App';
import {
  postNewProject,
  deleteProject as deleteProjectOnServer,
} from '../logic/fetchMethods';
import sortingFunctions from '../logic/sortingFunctions';
import SortInput from './SortInput';
import CompletableRow from './CompletableRow/CompletableRow';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      alignItems: 'center',
      flexGrow: 1,
    },
    projectItem: {
      paddingLeft: theme.spacing(4),
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.secondary.main,
    },
    label: {
      alignSelf: 'center',
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
  projects: ProjectObjects;
  tasks: TaskObjects;
  user: User;
  setProjects: SetProjectsFunction;
  setProject: SetProjectFunction;
  setUser: SetUserFunction;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
}

export type ProjectTableState = unknown;

/**
 * Represents the complete table of projects in the UI, as well as modification
 * components such as sorting and project addition buttons.
 *
 * @param {ProjectTableProps} props the props
 */
function ProjectTable(props: ProjectTableProps) {
  const {
    projects,
    tasks,
    user,
    setProjects,
    setProject,
    setUser,
    setTask,
    setTasks,
    classes,
  } = props;

  const [sortBy, setSortBy] = useState('Priority');

  /**
   * Adds the project to the user state and the project objects state.
   *
   * @private
   * @param {Project} newProject the new project to add to state
   */
  function addProjectToState(newProject: Project): void {
    projects[newProject._id] = newProject;
    user.projects.push(newProject._id);
    setProjects(projects);
    setUser(user);
  }

  /**
   * Generates a function that will delete the specified project in state and
   * on the server.
   *
   * @param {Project} projectToDelete the project to delete
   */
  function deleteProject(projectToDelete: Project) {
    return async () => {
      // Delete the project from state first
      delete projects[projectToDelete._id];
      setProjects(projects);
      user.projects.splice(user.projects.indexOf(projectToDelete._id), 1);
      setUser(user);

      // Make the request to delete the project
      await deleteProjectOnServer(projectToDelete);
    };
  }

  /**
   * Adds a project to the server, and to state. This can be passed down to
   * child components.
   *
   * @param {string} projectTitle the title of the new project
   */
  async function addProject(): Promise<void> {
    const newProject = await postNewProject(user._id, 'Untitled');

    // Save the project to state
    addProjectToState(newProject);
  }

  return (
    <>
      <SortInput
        className={classes.sortInput}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />
      <div className={classes.root}>
        {Object.values(projects)
          .sort(sortingFunctions[sortBy])
          .map(projectDoc => {
            return (
              <CompletableRow
                settings={user.settings}
                deleteThisCompletable={deleteProject(projectDoc)}
                completableType="project"
                key={projectDoc._id}
                setTasks={setTasks}
                setProject={setProject}
                completable={projectDoc}
                tasks={tasks}
                setTask={setTask}
              />
            );
          })}
      </div>
      <Button className={classes.label} variant="outlined" onClick={addProject}>
        Add Project
      </Button>
    </>
  );
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
