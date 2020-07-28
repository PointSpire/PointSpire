import React, { useState, useEffect } from 'react';
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
import SettingsDialog from './SettingsDialog';
import LoginDialog from './LoginDialog';
import { AlertFunction } from '../../App';
import { logout } from '../../utils/fetchMethods';
import UserData from '../../clientData/UserData';
import { manualSave, windowUnloadListener } from '../../utils/savingTimer';
import { AppSaveStatus } from '../../clientData/AppSaveStatus';

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
  githubClientId: string;
  appTheme: Theme;
  setTheme: (theme: Theme) => void;
}

function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const { alert, setTheme, appTheme, githubClientId, classes } = props;
  /**
   * The items for the drawer that pops out of the left hand side.
   */
  const menuItems = {
    settings: {
      text: 'Settings',
      icon: <SettingsIcon />,
    },
    help: {
      text: 'Help',
      icon: <HelpIcon />,
    },
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(!!UserData.getUser().settings);
  const [savedStatus, setSavedStatus] = useState(AppSaveStatus.getStatus());

  const listenerId = `TopMenuBar`;

  /**
   * Subscribe to changes in the user object.
   */
  useEffect(() => {
    UserData.addUserListener(listenerId, user => {
      setLoggedIn(!!user);
    });

    return () => {
      UserData.removeUserListener(listenerId);
    };
  }, []);

  /**
   * Subscribe to changes in the saved status
   */
  useEffect(() => {
    AppSaveStatus.addSavedStatusListener(listenerId, updatedStatus => {
      setSavedStatus(updatedStatus);
    });

    return () => {
      AppSaveStatus.removeSavedStatusListener(listenerId);
    };
  }, []);

  /**
   * Load up the window listener for pending changes.
   */
  useEffect(() => {
    // Prevent unload of the app if the user has any unsaved changes
    window.addEventListener('beforeunload', windowUnloadListener);

    // Remove the window listener when the component unmounts
    return () => {
      window.removeEventListener('beforeunload', windowUnloadListener);
    };
  }, []);

  /**
   * Represents the component for the top menu and title bar, ass well as the
   * drawer that can pop out from the left hand side.
   */
  function checkAndSetSettingsOpen(open: boolean) {
    const userSettings = UserData.getUser().settings;
    if (!userSettings) {
      alert('error', 'You must login first to access settings');
    } else {
      setSettingsOpen(open);
    }
  }

  /**
   * Creates a handler that can be used to change the `settingsOpen` state.
   *
   * @param {boolean} open true if this should set the SettingsDialog to open,
   * and false if not
   */
  function createSetSettingsOpenHandler(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setSettingsOpen(open);
    };
  }

  /**
   * Creates a handler that sets the sate of the `loginOpen` state.
   *
   * @param {boolean} open
   */
  function createSetLoginOpenHandler(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setLoginOpen(open);
    };
  }

  function createDrawerOpenHandler(open: boolean) {
    return (event: React.KeyboardEvent | React.MouseEvent) => {
      if (
        event.type === 'keydown' &&
        ((event as React.KeyboardEvent).key === 'Tab' ||
          (event as React.KeyboardEvent).key === 'Shift')
      ) {
        return;
      }

      setDrawerOpen(open);
    };
  }

  let settingsDialog: JSX.Element;
  if (UserData.getUser().settings) {
    settingsDialog = (
      <SettingsDialog
        open={settingsOpen}
        setOpen={checkAndSetSettingsOpen}
        alert={alert}
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
      onClick={createDrawerOpenHandler(false)}
      onKeyDown={createDrawerOpenHandler(false)}
    >
      <List>
        {Object.values(menuItems).map(menuItem => (
          <ListItem
            key={menuItem.text}
            button
            onClick={
              menuItem.text === menuItems.settings.text
                ? createSetSettingsOpenHandler(true)
                : undefined
            }
          >
            <ListItemIcon>{menuItem.icon}</ListItemIcon>
            <ListItemText primary={menuItem.text} />
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
            onClick={createDrawerOpenHandler(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" className={classes.title}>
            PointSpire
          </Typography>
          {loggedIn && (
            <Button color="inherit" onClick={manualSave}>
              {savedStatus}
            </Button>
          )}
          <Button
            color="inherit"
            onClick={loggedIn ? logout : createSetLoginOpenHandler(true)}
          >
            {loggedIn ? 'Logout' : 'Login'}
          </Button>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={createDrawerOpenHandler(false)}
      >
        {menuList}
      </Drawer>
      <LoginDialog
        githubClientId={githubClientId}
        open={loginOpen}
        setOpen={setLoginOpen}
      />
      {settingsDialog}
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(TopMenuBar);
