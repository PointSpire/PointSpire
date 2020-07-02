import React from 'react';
import { Button, List, ListItem } from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { ProjectObjects, TaskObjects, Project, User } from '../logic/dbTypes';
import ProjectRow from './ProjectRow';
import {
  SetProjectsFunction,
  SetProjectFunction,
  SetUserFunction,
  SetTaskFunction,
  SetTasksFunction,
} from '../App';
import { postNewProject } from '../logic/fetchMethods';
import prioritySortDescending from '../logic/sortingFunctions';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      // backgroundColor: theme.palette.background.default,
      alignItems: 'center',
    },
    // projectItem: {
    //   paddingLeft: theme.spacing(4),
    //   backgroundColor: theme.palette.background.paper,
    //   borderColor: theme.palette.secondary.main,
    // },
    addProjectButton: {
      alignSelf: 'center',
      background: theme.palette.primary.main,
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

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);

    this.addProject = this.addProject.bind(this);
  }

  /**
   * Adds the project to the user state and the project objects state.
   *
   * @private
   * @param {Project} newProject the new project to add to state
   */
  private addProjectToState(newProject: Project): void {
    const { setProjects, projects, user, setUser } = this.props;
    projects[newProject._id] = newProject;
    user.projects.push(newProject._id);
    setProjects(projects);
    setUser(user);
  }

  /**
   * Adds a project to the server, and to state. This can be passed down to
   * child components.
   *
   * @param {string} projectTitle the title of the new project
   */
  async addProject(): Promise<void> {
    const { user } = this.props;
    const newProject = await postNewProject(user._id, 'Untitled');

    // Save the project to state
    this.addProjectToState(newProject);
  }

  render() {
    const {
      classes,
      projects,
      tasks,
      setTask,
      setProject,
      setTasks,
    } = this.props;
    const { addProject } = this;
    return (
      <List>
        {Object.values(projects)
          .sort(prioritySortDescending)
          .map(projectDoc => {
            return (
              <ProjectRow
                key={projectDoc._id}
                setTasks={setTasks}
                setProject={setProject}
                project={projectDoc}
                tasks={tasks}
                setTask={setTask}
              />
            );
          })}
        <ListItem>
          <Button
            className={classes.addProjectButton}
            variant="outlined"
            fullWidth
            onClick={addProject}
          >
            Add Project
          </Button>
        </ListItem>
      </List>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
