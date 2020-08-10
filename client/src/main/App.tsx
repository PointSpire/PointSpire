import React, { useState, useEffect } from 'react';
import Debug from 'debug';
import './App.css';
import { createMuiTheme, ThemeProvider, Theme } from '@material-ui/core/styles';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import TopMenuBar from './components/TopMenuBar';
import { AllUserData } from './utils/dbTypes';
import { getUserData, getTestUserData } from './utils/fetchMethods';
import baseThemeOptions from './AppTheme';
import Completables from './models/Completables';
import User from './models/User';
import AppRoutes from './components/AppRoutes';
import MobileProvider from './components/MobileProvider';

const debug = Debug('App.tsx');
debug.enabled = false;

/**
 * Used to determine the severity of an alert for the snackbar of the app.
 */
type SnackBarSeverity = 'error' | 'warning' | 'info' | 'success';

/**
 * The type of the method `alert`. This can be used to specify
 * the functions type when passing it down as a prop to other components.
 */
export type AlertFunction = (
  severity: SnackBarSeverity,
  message: string
) => void;

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
const App = () => {
  const [snackBarOpen, setSnackBarOpen] = useState(false);
  const [snackBarSeverity, setSnackBarSeverity] = useState<SnackBarSeverity>(
    'error'
  );
  const [snackBarText, setSnackBarText] = useState<string>('uknown');
  const [appTheme, setAppTheme] = useState<Theme>(
    createMuiTheme(baseThemeOptions)
  );
  const [projectIds, setProjectIds] = useState<null | string[]>(null);

  const mobile = useMediaQuery(appTheme.breakpoints.down('sm'));

  /**
   * Gets user data from server.
   */
  async function getData() {
    let userData: AllUserData | null;
    if (process.env.REACT_APP_ENV === 'LOCAL_DEV') {
      userData = await getTestUserData();
    } else {
      userData = await getUserData();
    }

    debug('userData is: ', userData);

    if (userData) {
      Completables.setProjects(userData.projects);
      Completables.setTasks(userData.tasks);
      User.set(userData.user);
      setProjectIds(userData.user.projects);
    }
  }

  /**
   * Runs after the component is mounted. This is the best place for API calls.
   */
  useEffect(() => {
    getData();
  }, []);

  /**
   * Displays a kind of "toast" at the bottom of the screen in the form of a
   * MuiAlert dialog. This can be colored based on the severity.
   *
   * @param {SnackBarSeverity} severity The severity of the message, which is
   * green for success, blue for information, yellow for warning, and red
   * for error
   * @param {string} message The message to display in the toast message
   */
  const alert: AlertFunction = (
    severity: SnackBarSeverity,
    message: string
  ) => {
    setSnackBarOpen(true);
    setSnackBarSeverity(severity);
    setSnackBarText(message);
  };

  return (
    <div className="App">
      <ThemeProvider theme={appTheme}>
        <MobileProvider mobile={mobile}>
          <TopMenuBar
            githubClientId={githubClientId}
            alert={alert}
            appTheme={appTheme}
            setTheme={setAppTheme}
          />
          <AppRoutes projectIds={projectIds} />
          <Snackbar
            open={snackBarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackBarOpen(false)}
          >
            <MuiAlert
              elevation={6}
              variant="filled"
              severity={snackBarSeverity}
            >
              {snackBarText}
            </MuiAlert>
          </Snackbar>
        </MobileProvider>
      </ThemeProvider>
    </div>
  );
};

export default App;
