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
import SettingsDialog from './SettingsDialog/SettingsDialog';
import LoginDialog from './LoginDialog';
import { AlertFunction } from '../App';
import { logout } from '../logic/fetchMethods';
import ClientData from '../logic/ClientData';
import { PendingChanges, manualSave } from '../logic/savingTimer';

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
  pendingChanges: PendingChanges;
}

function TopMenuBar(props: TopMenuBarProps): JSX.Element {
  const {
    alert,
    setTheme,
    appTheme,
    githubClientId,
    classes,
    pendingChanges,
  } = props;
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
  const [loggedIn, setLoggedIn] = useState(!!ClientData.getUser().settings);

  const listenerId = `TopMenuBar`;

  /**
   * Subscribe to changes in the user object.
   */
  useEffect(() => {
    ClientData.addUserListener(listenerId, user => {
      setLoggedIn(!!user);
    });

    return () => {
      ClientData.removeUserListener(listenerId);
    };
  }, []);

  /**
   * Represents the component for the top menu and title bar, ass well as the
   * drawer that can pop out from the left hand side.
   */
  function checkAndSetSettingsOpen(open: boolean) {
    const userSettings = ClientData.getUser().settings;
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
  if (ClientData.getUser().settings) {
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
              {pendingChanges}
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
