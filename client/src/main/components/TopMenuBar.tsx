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
import SettingsDialog from './SettingsDialog';

/* This is not a good solution, but the alternative seems to be ejecting
from create-react-app */
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

export type TopMenuBarProps = WithStyles<typeof styles>;

export interface TopMenuBarState {
  drawerOpen: boolean;
  settingsOpen: boolean;
}

class TopMenuBar extends React.Component<TopMenuBarProps, TopMenuBarState> {
  static optionsItems = {
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
    };

    this.createSetSettingsOpenHandler = this.createSetSettingsOpenHandler.bind(
      this
    );
    this.setSettingsOpen = this.setSettingsOpen.bind(this);
    this.toggleDrawer = this.toggleDrawer.bind(this);
  }

  setSettingsOpen(open: boolean) {
    this.setState({ settingsOpen: open });
  }

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
    const { optionsItems } = TopMenuBar;
    const {
      state,
      setSettingsOpen,
      toggleDrawer,
      createSetSettingsOpenHandler,
    } = this;
    const { classes } = this.props;
    const list = (
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
              onClick={() => {
                window.open(
                  'https://point-spire.herokuapp.com/auth/github',
                  '_self'
                );
              }}
            >
              Login
            </Button>
          </Toolbar>
        </AppBar>
        <Drawer
          anchor="left"
          open={state.drawerOpen}
          onClose={toggleDrawer(false)}
        >
          {list}
        </Drawer>
        <SettingsDialog open={state.settingsOpen} setOpen={setSettingsOpen} />
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(TopMenuBar);
