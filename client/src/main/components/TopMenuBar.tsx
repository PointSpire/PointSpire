import React from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import MenuIcon from '@material-ui/icons/Menu';
import SettingsIcon from '@material-ui/icons/Settings';
import HelpIcon from '@material-ui/icons/Help';
import SettingsDialog from './SettingsDialog/SettingsDialog';
import LoginDialog from './LoginDialog';
import {
  AlertFunction,
  UpdateSettingsFunction,
  UpdateUserOnServerFunction,
} from '../App';
import { UserSettings } from '../logic/dbTypes';
import { logout } from '../logic/fetchMethods';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
    list: {
      width: 250,
    },
    fullList: {
      width: 'auto',
    },
  });
}

export interface TopMenuBarProps extends WithStyles<typeof styles> {
  alert: AlertFunction;
  userSettings?: UserSettings;
  updateSettings?: UpdateSettingsFunction;
  sendUpdatedUserToServer: UpdateUserOnServerFunction;
  baseServerUrl: string;
  githubClientId: string;
  appTheme: Theme;
  setTheme: (theme: Theme) => void;
  loggedIn: boolean;
}

export interface TopMenuBarState {
  /**
   * Determines if the left drawer is open for the menu.
   */
  drawerOpen: boolean;

  /**
   * Determines if the SettingsDialog is open.
   */
  settingsOpen: boolean;
  loginOpen: boolean;
}

/**
 * Represents the component for the top menu and title bar, ass well as the
 * drawer that can pop out from the left hand side.
 */
class TopMenuBar extends React.Component<TopMenuBarProps, TopMenuBarState> {
  /**
   * The items for the drawer that pops out of the left hand side.
   */
  static menuItems = {
    settings: {
      text: 'Settings',
      icon: <SettingsIcon />,
    },
    help: {
      text: 'Help',
      icon: <HelpIcon />,
    },
  };

  constructor(props: TopMenuBarProps) {
    super(props);
    this.state = {
      drawerOpen: false,
      settingsOpen: false,
      loginOpen: false,
    };

    this.createSetSettingsOpenHandler = this.createSetSettingsOpenHandler.bind(
      this
    );
    this.setSettingsOpen = this.setSettingsOpen.bind(this);
    this.createSetLoginOpenHandler = this.createSetLoginOpenHandler.bind(this);
    this.setLoginOpen = this.setLoginOpen.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  /**
   * Sets the `settingsOpen` state indicating if the SettingsDialog is open
   * or not.
   *
   * @param {boolean} open true if it should be open and false if not
   */
  setSettingsOpen(open: boolean) {
    const { userSettings, alert } = this.props;
    if (!userSettings) {
      alert('error', 'You must login first to access settings');
    } else {
      this.setState({ settingsOpen: open });
    }
  }

  /**
   * Sets the `loginOpen` state indicating if the LoginDialog is open or not.
   *
   * @param {boolean} open
   */
  setLoginOpen(open: boolean) {
    this.setState({ loginOpen: open });
  }

  /**
   * Creates a handler that can be used to change the `settingsOpen` state.
   *
   * @param {boolean} open true if this should set the SettingsDialog to open,
   * and false if not
   */
  createSetSettingsOpenHandler(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      this.setSettingsOpen(open);
    };
  }

  /**
   * Creates a handler that sets the sate of the `loginOpen` state.
   *
   * @param {boolean} open
   */
  createSetLoginOpenHandler(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      this.setLoginOpen(open);
    };
  }

  /**
   * Handles opening of the menu drawer.
   *
   * @param {boolean} open true if it should be open and false if not
   */
  toggleDrawer(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      this.setState({ drawerOpen: open });
    };
  }

  render(): JSX.Element {
    const { menuItems: optionsItems } = TopMenuBar;
    const {
      state,
      setSettingsOpen,
      setLoginOpen,
      toggleDrawer,
      createSetSettingsOpenHandler,
    } = this;
    const {
      classes,
      alert,
      userSettings,
      updateSettings,
      sendUpdatedUserToServer,
      githubClientId,
      appTheme,
      setTheme,
      loggedIn,
    } = this.props;

    // Set up the settingsDialog based on existence of user info
    let settingsDialog: JSX.Element;
    if (userSettings !== undefined && updateSettings !== undefined) {
      settingsDialog = (
        <SettingsDialog
          sendUpdatedUserToServer={sendUpdatedUserToServer}
          updateSettings={updateSettings}
          open={state.settingsOpen}
          setOpen={setSettingsOpen}
          alert={alert}
          settings={userSettings}
          appTheme={appTheme}
          setTheme={setTheme}
        />
      );
    } else {
      settingsDialog = <div />;
    }

    /**
     * The list of items in the menu rendered in JSX.
     */
    const menuList = (
      <div
        className={classes.list}
        role="presentation"
        onClick={toggleDrawer(false)}
        onKeyDown={toggleDrawer(false)}
      >
        <List>
          {Object.values(optionsItems).map(optionItem => (
            <ListItem
              key={optionItem.text}
              button
              onClick={
                optionItem.text === optionsItems.settings.text
                  ? createSetSettingsOpenHandler(true)
                  : undefined
              }
            >
              <ListItemIcon>{optionItem.icon}</ListItemIcon>
              <ListItemText primary={optionItem.text} />
            </ListItem>
          ))}
        </List>
      </div>
    );

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              className={classes.menuButton}
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" className={classes.title}>
              PointSpire
            </Typography>
            <Button
              color="inherit"
              onClick={loggedIn ? logout : this.createSetLoginOpenHandler(true)}
            >
              {loggedIn ? 'Logout' : 'Login'}
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={state.drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {menuList}
        </Drawer>
        <LoginDialog
          githubClientId={githubClientId}
          open={state.loginOpen}
          setOpen={setLoginOpen}
        />
        {settingsDialog}
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TopMenuBar);
