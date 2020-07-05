import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider, Theme } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import { Snackbar } from '@material-ui/core';
import TopMenuBar from './components/TopMenuBar';
import { User, AllUserData, UserSettings } from './logic/dbTypes';
import ProjectTable from './components/ProjectTable';
import {
  getUserData,
  getTestUserData,
  baseServerUrl,
} from './logic/fetchMethods';
import baseThemeOptions from './AppTheme';
import ClientData from './logic/ClientData';

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

  appTheme: Theme;
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
      appTheme: createMuiTheme(baseThemeOptions),
    };

    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
    this.alert = this.alert.bind(this);
    this.updateSettings = this.updateSettings.bind(this);
    this.sendUpdatedUserToServer = this.sendUpdatedUserToServer.bind(this);
    this.setUser = this.setUser.bind(this);
    this.setTheme = this.setTheme.bind(this);
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

    // Set the ClientData first
    ClientData.setProjects(userData.projects);
    ClientData.setTasks(userData.tasks);

    // Then set the state for the application
    this.setUser(userData.user);
  }

  setUser(updatedUser: User): void {
    this.setState({
      user: updatedUser,
    });
  }

  /**
   * Updates the theme for the application. This should only be updated by
   * modifying particular variables and not replacing the theme fresh because
   * it is quite large.
   *
   * @param {Theme} updatedTheme the updated theme object
   */
  setTheme(updatedTheme: Theme): void {
    this.setState({
      appTheme: updatedTheme,
    });
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
      appTheme,
    } = this.state;
    const {
      handleSnackBarClose,
      alert,
      updateSettings,
      sendUpdatedUserToServer,
      setUser,
      setTheme,
    } = this;
    return (
      <div className="App">
        <ThemeProvider theme={appTheme}>
          <TopMenuBar
            githubClientId={githubClientId}
            baseServerUrl={baseServerUrl}
            sendUpdatedUserToServer={sendUpdatedUserToServer}
            alert={alert}
            userSettings={user ? user.settings : undefined}
            updateSettings={updateSettings}
            appTheme={appTheme}
            setTheme={setTheme}
          />
          {/* If projects and tasks exist, show project table */}
          {user && ClientData.getProjects() ? (
            <ProjectTable setUser={setUser} user={user} />
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
 * The type of the method 'setUser' on the App class.
 */
export type SetUserFunction = typeof App.prototype.setUser;

export default App;
