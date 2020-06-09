import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Menu from '@material-ui/core/Menu';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
    },
  })
);

export interface MainMenuProps {
  menuTitle: string;
  menuTrigger: (select: number) => void;
}

export default function MainMenu(
  props: MainMenuProps
): React.FunctionComponentElement<MainMenuProps> {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const classes = useStyles();

  const { menuTitle } = props;

  const handleMenuAction = (id: string): void => {
    if (id === 'tasks') {
      props.menuTrigger(0);
    } else if (id === 'settings') {
      props.menuTrigger(1);
    }
  };

  return (
    <div className={classes.root}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            aria-controls="main-menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="main-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem
              onClick={(): void => {
                handleMenuAction('tasks');
              }}
            >
              Tasks
            </MenuItem>
            <MenuItem
              onClick={(): void => {
                handleMenuAction('settings');
              }}
            >
              Settings
            </MenuItem>
          </Menu>
          <Typography variant="h6" className={classes.title}>
            {menuTitle}
          </Typography>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}
