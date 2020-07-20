import React from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider, Theme } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';

import { Snackbar } from '@material-ui/core';
import TopMenuBar from './components/TopMenuBar';
import { AllUserData } from './utils/dbTypes';
import ProjectTable from './components/ProjectTable';
import { getUserData, getTestUserData } from './utils/fetchMethods';
import baseThemeOptions from './AppTheme';
import UserData from './clientData/UserData';

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
   * State for the projectIds which is just used to show the ProjectTable
   */
  projectIds: Array<string> | null;

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
      appTheme: createMuiTheme(baseThemeOptions),
      projectIds: null,
    };

    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
    this.alert = this.alert.bind(this);
    this.setTheme = this.setTheme.bind(this);
    this.setProjectIds = this.setProjectIds.bind(this);
  }

  /**
   * Runs after the component is mounted. This is the best place for API calls.
   */
  async componentDidMount(): Promise<void> {
    // Get the data for the user
    let userData: AllUserData | null;
    if (process.env.REACT_APP_ENV === 'LOCAL_DEV') {
      userData = await getTestUserData();
    } else {
      userData = await getUserData();
    }

    if (userData) {
      UserData.setProjects(userData.projects);
      UserData.setTasks(userData.tasks);
      UserData.setUser(userData.user);
      this.setProjectIds(userData.user.projects);
    }
  }

  setProjectIds(updatedProjectIds: Array<string>): void {
    this.setState({
      projectIds: updatedProjectIds,
    });
  }

  /**
   * Updates the theme for the application.
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
      appTheme,
      projectIds,
    } = this.state;
    const { handleSnackBarClose, alert, setTheme } = this;
    return (
      <div className="App">
        <ThemeProvider theme={appTheme}>
          <TopMenuBar
            githubClientId={githubClientId}
            alert={alert}
            appTheme={appTheme}
            setTheme={setTheme}
          />
          {projectIds ? <ProjectTable /> : <></>}
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

export default App;
