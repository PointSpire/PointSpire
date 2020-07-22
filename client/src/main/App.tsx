import React, { useState, useEffect } from 'react';
import './App.css';
import { createMuiTheme, ThemeProvider, Theme } from '@material-ui/core/styles';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import MuiAlert, { Color as SnackBarSeverity } from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import TopMenuBar from './components/TopMenuBar';
import { AllUserData } from './logic/dbTypes';
import { getUserData, getTestUserData } from './logic/fetchMethods';
import baseThemeOptions from './AppTheme';
import ClientData from './logic/ClientData/ClientData';
import IndexRoute from './routes/IndexRoute';
import CompletableDetailsRoute from './routes/CompletableDetailsRoute';
import ModalCompletableDetailsRoute from './routes/ModalCompletableDetailsRoute';
import { MobileContext } from './contexts';

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
   * Gets user data from server
   */
  async function getData() {
    let userData: AllUserData | null;
    if (process.env.REACT_APP_ENV === 'LOCAL_DEV') {
      userData = await getTestUserData();
    } else {
      userData = await getUserData();
    }

    if (userData) {
      ClientData.setProjects(userData.projects);
      ClientData.setTasks(userData.tasks);
      ClientData.setUser(userData.user);
      setProjectIds(userData.user.projects);
    }
  }

  /**
   * Runs after the component is mounted. This is the best place for API calls.
   */
  useEffect(() => {
    getData();
  });

  /**
   * Displays a kind of "toast" at the bottom of the screen in the form of a
   * MuiAlert dialog. This can be colored based on the severity.
   *
   * @param {SnackBarSeverity} severity The severity of the message, which is
   * green for success, blue for information, yellow for warning, and red
   * for error
   * @param {string} message The message to display in the toast message
   */
  function alert(severity: SnackBarSeverity, message: string): void {
    setSnackBarOpen(true);
    setSnackBarSeverity(severity);
    setSnackBarText(message);
  }

  return (
    <div className="App">
      <MobileContext.Provider value={mobile}>
        <ThemeProvider theme={appTheme}>
          <BrowserRouter>
            <TopMenuBar
              githubClientId={githubClientId}
              alert={alert}
              appTheme={appTheme}
              setTheme={setAppTheme}
            />
            {mobile ? (
              <Switch>
                <Route exact path="/">
                  {projectIds && <IndexRoute />}
                </Route>
                <Route
                  path="/c/:completableType/:completableId"
                  render={({ location: { key } }) =>
                    projectIds && <CompletableDetailsRoute key={key} />
                  }
                />
              </Switch>
            ) : (
              <>
                <Route path="/">{projectIds && <IndexRoute />}</Route>
                <Route path="/c/:completableType/:completableId">
                  <ModalCompletableDetailsRoute />
                </Route>
              </>
            )}
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
          </BrowserRouter>
        </ThemeProvider>
      </MobileContext.Provider>
    </div>
  );
};

/**
 * The type of the method `alert` on the App class. This can be used to specify
 * the functions type when passing it down as a prop to other components.
 */
export type AlertFunction = typeof App.prototype.alert;

export default App;
