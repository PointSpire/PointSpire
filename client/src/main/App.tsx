import React from 'react';
import './App.css';
import { ThemeProvider } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';
import TopMenuBar from './components/TopMenuBar';
import {
  User,
  AllUserData,
  ProjectObjects,
  TaskObjects,
  UserSettings,
  Project,
  Task,
} from './logic/dbTypes';
import ProjectTable from './components/ProjectTable';
import {
  postNewProject,
  getUserData,
  getTestUserData,
  baseServerUrl,
} from './logic/fetchMethods';
import buildTheme from './pointSpireTheme';

const theme = buildTheme();

/**
 * Used to determine the severity of an alert for the snackbar of the app.
 */
type SnackBarSeverity = 'error' | 'warning' | 'info' | 'success';

type AppState = {
  /**
   * Determines if the toast window at the bottom is open.
   */
  snackBarOpen: boolean;

  /**
   * The current severity that was set for the toast window at the bottom.
   */
  snackBarSeverity: SnackBarSeverity;

  /**
   * The text for the toast window at the bottom.
   */
  snackBarText: string;

  /**
   * The primary user object in memory for the client.
   */
  user?: User;

  /**
   * All of the projects associated with the user.
   */
  projects?: ProjectObjects;

  /**
   * All of the tasks associated with the user.
   */
  tasks?: TaskObjects;
};

type AppProps = unknown;

// Set the githubClientId. See the .env file for details.
let githubClientId: string;
if (process.env.REACT_APP_AUTH === 'LOCAL') {
  githubClientId = '57646d785e4ce63a280c';
} else {
  githubClientId = 'f6a5702090e186626681';
}

/**
 * Represents the main application window.
 */
class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      snackBarOpen: false,
      snackBarSeverity: 'error',
      snackBarText: 'unknown',
      user: undefined,
      projects: {},
      tasks: {},
    };

    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
    this.alert = this.alert.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.sendUpdatedUserToServer = this.sendUpdatedUserToServer.bind(this);
    this.setProjects = this.setProjects.bind(this);
    this.setProject = this.setProject.bind(this);
    this.setTasks = this.setTasks.bind(this);
    this.setTask = this.setTask.bind(this);
    this.setUser = this.setUser.bind(this);
  }

  /**
   * Runs after the component is mounted. This is the best place for API calls.
   */
  async componentDidMount(): Promise<void> {
    // Get the data for the user
    let userData: AllUserData;
    if (process.env.REACT_APP_ENV === 'LOCAL_DEV') {
      userData = await getTestUserData();
    } else {
      userData = await getUserData();
    }
    this.setState({
      user: userData.user,
      projects: userData.projects,
      tasks: userData.tasks,
    });
  }

  // #region Project Functions
  /**
   * Updates the projects state on the app.
   *
   * @param {Project} updatedProjects the new ProjectObjects object to set for
   * projects on the app
   */
  setProjects(updatedProjects: ProjectObjects): void {
    this.setState({
      projects: updatedProjects,
    });
  }

  /**
   * Updates the given project in the app's projects state.
   * @param {Project} updatedProject the updated project
   */
  setProject(updatedProject: Project): void {
    const { projects } = this.state;
    if (projects) {
      // eslint-disable-next-line no-underscore-dangle
      projects[updatedProject._id] = updatedProject;
      this.setProjects(projects);
    }
  }

  /**
   * Updates a particular task in the tasks state of the app.
   *
   * @param {Task} updatedTask the Task object to update in the tasks state
   */
  setTask(updatedTask: Task): void {
    const { tasks } = this.state;
    if (tasks) {
      tasks[updatedTask._id] = updatedTask;
      this.setTasks(tasks);
    }
  }

  setUserProjects(newProject: Project): void {
    const { user } = this.state;
    if (user) {
      const temp = user.projects;
      temp.push(newProject._id);
      user.projects = temp;
      this.setState({
        user,
      });
    }
  }
  // #endregion

  setUser(updatedUser: User): void {
    this.setState({
      user: updatedUser,
    });
  }

  /**
   * Updates the tasks state on the app.
   *
   * @param {Task} updatedTasks the new TaskObjects object to set for tasks on
   * the app
   */
  setTasks(updatedTasks: TaskObjects): void {
    const { tasks } = this.state;
    // eslint-disable-next-line
    console.log(tasks);
    this.setState({
      tasks: updatedTasks,
    });
  }

  async addProject(newTitle: string): Promise<void> {
    const { projects, user } = this.state;
    if (user && projects) {
      const newProject = await postNewProject(user._id, newTitle);
      this.setProject(newProject);
      this.setUserProjects(newProject);
    }
  }

  handleSnackBarClose(): void {
    this.setState({
      snackBarOpen: false,
    });
  }

  /**
   * Sends the current `user` stored in the app's state to the server as a
   * patch request. This can be passed down to any component that modifies
   * some part of the `user` object in the app's state.
   *
   * @returns {boolean} true if successful and false if not
   */
  async sendUpdatedUserToServer(): Promise<boolean> {
    const { user } = this.state;
    if (user) {
      const res = await fetch(`${baseServerUrl}/api/users/${user._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
      return res.status === 200;
    }
    return false;
  }

  /**
   * Updates the settings for the user on the client side. This does not send
   * the updated settings to the server. For that, use
   * `sendUpdatedUserToServer`. This can be passed down to components that
   * modify settings for the user.
   *
   * @param {UserSettings} updatedSettings the updated settings object to save
   * to the user state
   */
  updateSettings(updatedSettings: UserSettings): void {
    const { user } = this.state;
    if (user) {
      user.settings = updatedSettings;
      this.setUser(user);
    }
  }

  /**
   * Displays a kind of "toast" at the bottom of the screen in the form of a
   * MuiAlert dialog. This can be colored based on the severity.
   *
   * @param {SnackBarSeverity} severity The severity of the message, which is
   * green for success, blue for information, yellow for warning, and red
   * for error
   * @param {string} message The message to display in the toast message
   */
  alert(severity: SnackBarSeverity, message: string): void {
    this.setState({
      snackBarOpen: true,
      snackBarSeverity: severity,
      snackBarText: message,
    });
  }

  render(): JSX.Element {
    const {
      snackBarOpen,
      snackBarSeverity,
      snackBarText,
      user,
      projects,
      tasks,
    } = this.state;
    const {
      handleSnackBarClose,
      alert,
      updateSettings,
      sendUpdatedUserToServer,
      setProjects,
      setProject,
      setUser,
      setTask,
      setTasks,
    } = this;
    return (
      <div className="App">
        <ThemeProvider theme={theme}>
          <TopMenuBar
            githubClientId={githubClientId}
            baseServerUrl={baseServerUrl}
            sendUpdatedUserToServer={sendUpdatedUserToServer}
            alert={alert}
            userSettings={user ? user.settings : undefined}
            updateSettings={updateSettings}
          />
          {/* If projects and tasks exist, show project table */}
          {projects && tasks && user ? (
            <ProjectTable
              setUser={setUser}
              setProjects={setProjects}
              setProject={setProject}
              setTask={setTask}
              setTasks={setTasks}
              projects={projects}
              tasks={tasks}
              user={user}
            />
          ) : (
            ''
          )}
          <Snackbar
            open={snackBarOpen}
            autoHideDuration={3000}
            onClose={handleSnackBarClose}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity={snackBarSeverity}
            >
              {snackBarText}
            </MuiAlert>
          </Snackbar>
        </ThemeProvider>
      </div>
    );
  }
}

/**
 * The type of the method `alert` on the App class. This can be used to specify
 * the functions type when passing it down as a prop to other components.
 */
export type AlertFunction = typeof App.prototype.alert;

/**
 * The type of the method 'updateSettings' on the App class.
 */
export type UpdateSettingsFunction = typeof App.prototype.updateSettings;

/**
 * The type of the method 'sendUpdatedUserToServer' on the App class.
 */
export type UpdateUserOnServerFunction = typeof App.prototype.sendUpdatedUserToServer;

/**
 * The type of the method 'setProjects' on the App class.
 */
export type SetProjectsFunction = typeof App.prototype.setProjects;

/**
 * The type of the method 'setProject' on the App class.
 */
export type SetProjectFunction = typeof App.prototype.setProject;

/**
 * The type of the method 'setUser' on the App class.
 */
export type SetUserFunction = typeof App.prototype.setUser;

/**
 * The type of the method 'setTask' on the App class.
 */
export type SetTaskFunction = typeof App.prototype.setTask;

/**
 * The type of the method 'setTasks' on the App class.
 */
export type SetTasksFunction = typeof App.prototype.setTasks;

export default App;
