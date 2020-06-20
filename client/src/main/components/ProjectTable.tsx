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
import { ProjectObjects, TaskObjects, Project, User, Task } from '../dbTypes';
import ProjectRow from './ProjectRow';
import {
  SetProjectsFunction,
  SetProjectFunction,
  SetUserFunction,
  SetTaskFunction,
  SetTasksFunction,
} from '../App';
import { postNewProject, postNewTask } from '../fetchMethods';

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
  newProjectTitle: string;
  newTaskTitle: string;
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
      newProjectTitle: '',
      newTaskTitle: '',
    };

    this.addProject = this.addProject.bind(this);
    this.addTaskToProject = this.addTaskToProject.bind(this);
    this._addTaskToProjectState = this._addTaskToProjectState.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.deleteTask = this.deleteTask.bind(this);
  }

  private handleTaskInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({
      newTaskTitle: e.target.value,
    });
  };

  public handleInputChange = (
    taskId: string,
    inputId: string,
    value: string
  ) => {
    const { tasks, setTask } = this.props;
    const foundTask = tasks[taskId];
    switch (inputId) {
      case 'title-input':
        foundTask.title = value;
        break;
      case 'note-input':
        foundTask.note = value;
        break;
      default:
        break;
    }
    this.setState(currState => ({
      changeCount: currState.changeCount + 1,
    }));
    setTask(foundTask);
  };

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

  /**
   * Adds a project to the server, and to state. This can be passed down to
   * child components.
   *
   * @param {string} projectTitle the title of the new project
   */
  async addProject(): Promise<void> {
    // const { baseServerUrl, user } = this.props;
    const { user } = this.props;
    const { newProjectTitle } = this.state;
    if (newProjectTitle.length > 0) {
      // Calls the fetch method in ./fetchMethods.ts
      const newProject = await postNewProject(user._id, newProjectTitle);

      // Save the project to state
      this._addProjectToState(newProject);
      this.setState({
        addProjectOpen: false,
      });
    }
  }

  private _addTaskToProjectState(newTask: Task, project: Project): void {
    const { setTasks, tasks, setProject, projects } = this.props;
    tasks[newTask._id] = newTask;
    const p = projects[project._id];
    p.subtasks.push(newTask._id);
    setTasks(tasks);
    setProject(p);
  }

  private _addTaskToTaskState(newTask: Task): void {
    const { tasks, setTasks } = this.props;
    tasks[newTask._id] = newTask;
    setTasks(tasks);
  }

  async addTaskToProject(projectId: string) {
    const { baseServerUrl, projects } = this.props;
    const { newTaskTitle } = this.state;
    const project = projects[projectId];

    const newTask = await postNewTask(
      `${baseServerUrl}/api/projects/~/subtasks`,
      projectId,
      newTaskTitle
    );

    this._addTaskToProjectState(newTask, project);
  }

  async addTaskToTask(parentId: string) {
    const { baseServerUrl } = this.props;
    const { newTaskTitle } = this.state;

    const newTask = await postNewTask(
      `${baseServerUrl}/api/tasks/~/subtasks`,
      parentId,
      newTaskTitle
    );

    this._addTaskToTaskState(newTask);
  }

  // eslint-disable-next-line
  deleteTask(taskId: string) {
    console.log(taskId);
  }

  autoUpdateUser() {
    // eslint-disable-next-line
    console.log(`Update user data: ${this.state.changeCount}`)
  }

  render() {
    const { classes, projects, tasks } = this.props;
    const {
      addProjectOpen,
      newProjectTitle,
      changeCount,
      newTaskTitle,
    } = this.state;
    const {
      handleInputChange,
      addProject,
      addTaskToProject,
      addTaskToTask,
      handleTaskInput,
      autoUpdateUser,
      deleteTask,
    } = this;
    if (changeCount > 40) {
      autoUpdateUser();
    }
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
                  project={projectDoc}
                  tasks={tasks}
                  handleChange={handleInputChange}
                  addTaskToProject={addTaskToProject}
                  handleTaskInput={handleTaskInput}
                  newTaskTitle={newTaskTitle}
                  addTaskToTask={addTaskToTask}
                  handleTaskDelete={deleteTask}
                />
              );
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
                  error={newProjectTitle.length === 0}
                  variant="outlined"
                  size="small"
                />
                <Button variant="contained" onClick={() => addProject()}>
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
              {addProjectOpen ? 'Cancel' : 'Create Project'}
            </Button>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export type AddTaskToProject = typeof ProjectTable.prototype.addTaskToProject;

export type AddTaskToTask = typeof ProjectTable.prototype.addTaskToTask;

export default withStyles(styles, { withTheme: true })(ProjectTable);
