import React from 'react';
import {
  Button,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Table,
} from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { ProjectObjects, TaskObjects, Project, User } from '../dbTypes';
import ProjectRow from './ProjectRow';
import {
  SetProjectsFunction,
  SetProjectFunction,
  SetUserFunction,
  SetTaskFunction,
  SetTasksFunction,
} from '../App';
import { postNewProject } from '../fetchMethods';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
      alignItems: 'center',
    },
    projectItem: {
      paddingLeft: theme.spacing(4),
      backgroundColor: theme.palette.background.paper,
      borderColor: theme.palette.secondary.main,
    },
    label: {
      alignSelf: 'center',
    },
  });
}

export interface ProjectTableProps extends WithStyles<typeof styles> {
  projects: ProjectObjects;
  tasks: TaskObjects;
  // addProject: (newTitle: string) => void;
  // handleChange: (taskId: string, inputId: string, value: string) => void;
  baseServerUrl: string;
  user: User;
  setProjects: SetProjectsFunction;
  setProject: SetProjectFunction;
  setUser: SetUserFunction;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
}

export interface ProjectTableState {
  changeCount: number;
  addProjectOpen: boolean;
}

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);
    this.state = {
      changeCount: 0,
      addProjectOpen: false,
    };

    this.addProject = this.addProject.bind(this);
  }

  /*
  private handleTaskInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      newTaskTitle: e.target.value,
    });
  };
  */

  /**
   * Adds the project to the user state and the project objects state.
   *
   * @private
   * @param {Project} newProject the new project to add to state
   */
  private _addProjectToState(newProject: Project): void {
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
    this._addProjectToState(newProject);
    this.setState({
      addProjectOpen: false,
    });
  }

  autoUpdateUser() {
    // eslint-disable-next-line
    console.log(`Update user data: ${this.state.changeCount}`);
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
    const { addProjectOpen } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell align="left">{projects.id}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(projects).map(projectDoc => {
              return (
                <ProjectRow
                  setTasks={setTasks}
                  setProject={setProject}
                  project={projectDoc}
                  tasks={tasks}
                  setTask={setTask}
                />
              );
            })}
            {/*
            <Collapse in={addProjectOpen} timeout="auto">
              <Paper>
                <TextField
                  id="new-project-title"
                  label="New Project Title"
                  value={newProjectTitle}
                  onChange={e => {
                    this.setState({
                      newProjectTitle: e.target.value,
                    });
                  }}
                  error={newProjectTitle.length === 0}
                  variant="outlined"
                  size="small"
                />
                <Button variant="contained" onClick={() => addProject()}>
                  Done
                </Button>
              </Paper>
            </Collapse>
            */}
            <Button
              className={classes.label}
              variant="outlined"
              fullWidth
              onClick={() => {
                this.setState(prev => {
                  return {
                    addProjectOpen: !prev.addProjectOpen,
                  };
                });
              }}
            >
              {addProjectOpen ? 'Cancel' : 'Create Project'}
            </Button>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
