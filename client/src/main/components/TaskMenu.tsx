import React from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';

export type TaskMenuProps = {
  deleteTask: () => void;
  addSubTask: (title: string) => Promise<void>;
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
    this.handleAddSubTask = this.handleAddSubTask.bind(this);
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

  handleAddSubTask(): void {
    const { addSubTask } = this.props;
    addSubTask('Untitled').catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
  }

  handleClose(): void {
    this.setAnchorEl(null);
  }

  render(): JSX.Element {
    const { handleClick, handleClose, handleDelete, handleAddSubTask } = this;
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
          <MenuItem onClick={handleAddSubTask}>Add SubTask</MenuItem>
          <MenuItem onClick={handleDelete}>Delete</MenuItem>
        </Menu>
      </div>
    );
  }
}

export default TaskMenu;
