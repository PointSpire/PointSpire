import React from 'react';
import './App.css';
import MuiAlert from '@material-ui/lab/Alert';
import { Snackbar } from '@material-ui/core';
import TopMenuBar from './components/TopMenuBar';
import { User } from './dbTypes';

/**
 * Used to determine the severity of an alert for the snackbar of the app.
 */
type SnackBarSeverity = 'error' | 'warning' | 'info' | 'success';

type AppState = {
  snackBarOpen: boolean;
  snackBarSeverity: SnackBarSeverity;
  snackBarText: string;
};

type AppProps = unknown;

async function getTestUser(): Promise<User> {
  let url = 'http://localhost:8055';
  url += '/api/users/5eda8ef7846e21ba6013cb19';
  const res = await fetch(url);
  const data = (await res.json()) as User;
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
    };

    this.handleSnackBarClose = this.handleSnackBarClose.bind(this);
    this.alert = this.alert.bind(this);
  }

  async componentDidMount(): Promise<void> {
    const testUser = await getTestUser();
    // eslint-disable-next-line
    console.log(testUser);
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
    const { snackBarOpen, snackBarSeverity, snackBarText } = this.state;
    const { handleSnackBarClose, alert } = this;
    return (
      <div className="App">
        <TopMenuBar alert={alert} />
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

export default App;
