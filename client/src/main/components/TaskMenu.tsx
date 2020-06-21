import React from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { deleteTaskFunction } from './TaskRow';

export type TaskMenuProps = {
  deleteTask: deleteTaskFunction;
};

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
    this.handleDelete = this.handleDelete.bind(this);
  }

  setAnchorEl(element: HTMLElement | null): void {
    this.setState({
      anchorEl: element,
    });
  }

  handleDelete(): void {
    const { deleteTask } = this.props;
    deleteTask();
  }

  handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    this.setAnchorEl(event.currentTarget);
  }

  handleClose(): void {
    this.setAnchorEl(null);
  }

  render(): JSX.Element {
    const { handleClick, handleClose, handleDelete } = this;
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
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
          <MenuItem>Some other test menu item</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default TaskMenu;
