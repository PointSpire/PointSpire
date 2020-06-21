import React from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

export type TaskMenuProps = unknown;

export interface TaskMenuState {
  anchorEl: HTMLElement | null;
}

class TaskMenu extends React.Component<TaskMenuProps, TaskMenuState> {
  constructor(props: TaskMenuProps) {
    super(props);
    this.state = {
      anchorEl: null,
    };
    this.setAnchorEl = this.setAnchorEl.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  setAnchorEl(element: HTMLElement | null): void {
    this.setState({
      anchorEl: element,
    });
  }

  handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    this.setAnchorEl(event.currentTarget);
  }

  handleClose(): void {
    this.setAnchorEl(null);
  }

  render(): JSX.Element {
    const { handleClick, handleClose } = this;
    const { anchorEl } = this.state;
    return (
      <div>
        <IconButton
          onClick={handleClick}
          aria-controls="simple-menu"
          aria-haspopup="true"
        >
          <MoreVertIcon />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem>Some test menu thing</MenuItem>
          <MenuItem>Some other test menu item</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default TaskMenu;
