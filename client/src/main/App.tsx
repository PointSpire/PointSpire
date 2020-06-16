import React from 'react';
import './App.css';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';
import TopMenuBar from './components/TopMenuBar';
import {
  User,
  AllUserData,
  ProjectObjects,
  TaskObjects,
  UserSettings,
} from './dbTypes';

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

/**
 * The base url for the server.
 */
const baseServerUrl =
  process.env.REACT_APP_ENV === 'LOCAL_DEV'
    ? 'http://localhost:8055'
    : 'https://point-spire.herokuapp.com';

/**
 * Gets data for a test user. This is setup just for development purposes
 * so the client always gets a user. Authentication can be used later.
 */
async function getTestUserData(): Promise<AllUserData> {
  const url = `${baseServerUrl}/api/users/5eda8ef7846e21ba6013cb19`;
  const res = await fetch(url);
  const data = (await res.json()) as AllUserData;
  return data;
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

    // SHOULD BE DELETED AFTER USAGE OF PROJECTS AND TASKS
    this.temporaryLoggingForTasksAndProjects = this.temporaryLoggingForTasksAndProjects.bind(
      this
    );
  }

  /**
   * Runs after the component is mounted. This is the best place for API calls.
   */
  async componentDidMount(): Promise<void> {
    // Get the data for the user
    const userData = await getTestUserData();
    this.setState({
      user: userData.user,
      projects: userData.projects,
      tasks: userData.tasks,
    });

    // SHOULD BE DELETED AFTER USAGE OF PROJECTS AND TASKS
    this.temporaryLoggingForTasksAndProjects();
  }

  /**
   * This should be deleted as sooon as projects and tasks are used on the
   * front end. This is kept in here so that no ESLint errors are thrown, but
   * the logic is still present to make it easier later.
   */
  temporaryLoggingForTasksAndProjects(): void {
    const { projects, tasks } = this.state;
    // eslint-disable-next-line
    console.log(JSON.stringify(projects, null, 2));
    // eslint-disable-next-line
    console.log(JSON.stringify(tasks, null, 2));
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
      // eslint-disable-next-line no-underscore-dangle
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
   * Closes the dialog / toast at the bottom of the screen.
   */
  handleSnackBarClose(): void {
    this.setState({
      snackBarOpen: false,
    });
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
      this.setState({
        user,
      });
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
    const { snackBarOpen, snackBarSeverity, snackBarText, user } = this.state;
    const {
      handleSnackBarClose,
      alert,
      updateSettings,
      sendUpdatedUserToServer,
    } = this;
    return (
      <div className="App">
        <TopMenuBar
          sendUpdatedUserToServer={sendUpdatedUserToServer}
          alert={alert}
          userSettings={user ? user.settings : undefined}
          updateSettings={updateSettings}
        />
        <header className="App-header">PointSpire</header>
        <Snackbar
          open={snackBarOpen}
          autoHideDuration={3000}
          onClose={handleSnackBarClose}
        >
          <MuiAlert elevation={6} variant="filled" severity={snackBarSeverity}>
            {snackBarText}
          </MuiAlert>
        </Snackbar>
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

export default App;
