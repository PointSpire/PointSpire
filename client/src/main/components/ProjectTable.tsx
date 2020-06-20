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
  Collapse,
  TextField,
} from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { ProjectObjects, TaskObjects, Project, User } from '../dbTypes';
import ProjectRow from './ProjectRow';
import { SetProjectsFunction, SetUserFunction } from '../App';

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
    nested: {
      paddingLeft: theme.spacing(4),
    },
    label: {
      alignSelf: 'center',
    },
  });
}

export interface ProjectTableProps extends WithStyles<typeof styles> {
  projects: ProjectObjects;
  tasks: TaskObjects;
  baseServerUrl: string;
  user: User;
  setProjects: SetProjectsFunction;
  setUser: SetUserFunction;
}

export interface ProjectTableState {
  projectTableOpen: boolean;
  addProjectOpen: boolean;
  newProjectTitle: string;
}

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);
    this.state = {
      projectTableOpen: true,
      addProjectOpen: false,
      newProjectTitle: '',
    };

    this.addProject = this.addProject.bind(this);
  }

  /**
   * Adds a project to the server, and to state. This can be passed down to
   * child components.
   *
   * @param {string} projectTitle the title of the new project
   */
  async addProject(projectTitle: string): Promise<void> {
    const { baseServerUrl, user } = this.props;
    const reqBody = {
      title: projectTitle,
    };

    const res = await fetch(`${baseServerUrl}/api/users/${user._id}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reqBody),
    });
    const newProject: Project = (await res.json()) as Project;

    // Save the project to state
    this._addProjectToState(newProject);
  }

  /**
   * Adds the project to the user state and the project objects state.
   *
   * @private
   * @param {Project} newProject the new project to add to state
   */
  _addProjectToState(newProject: Project): void {
    const { setProjects, projects, user, setUser } = this.props;
    projects[newProject._id] = newProject;
    user.projects.push(newProject._id);
    setProjects(projects);
    setUser(user);
  }

  render() {
    const { classes, projects, tasks } = this.props;
    const { projectTableOpen, addProjectOpen, newProjectTitle } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              {/* This will be removed when the state has something to do. */}
              {/* eslint-disable-next-line */}
              <TableCell>{`Remove Later! ${projectTableOpen}`}</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="right">Note</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">{projects.id}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(projects).map(projectDoc => {
              return <ProjectRow project={projectDoc} tasks={tasks} />;
            })}
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
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={() => this.addProject(newProjectTitle)}
                >
                  Done
                </Button>
              </Paper>
            </Collapse>
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
              Create Project
            </Button>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
