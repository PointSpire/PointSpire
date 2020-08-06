import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import SortMenu from './SortMenu';

export type TaskMenuProps = {
  deleteTask: () => void;
  addSubTask: (title: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  openPrereqTaskDialog: () => void;
};

/**
 * The menu for a task OR a project. This is a generalized component even though
 * it is called `TaskMenu`.
 *
 * @param {TaskMenuProps} props the props
 */
function TaskMenu(props: TaskMenuProps): JSX.Element {
  const {
    deleteTask,
    addSubTask,
    sortBy,
    setSortBy,
    openPrereqTaskDialog,
  } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  function handleDelete(): void {
    deleteTask();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    setAnchorEl(event.currentTarget);
  }

  function handleSortMenuClick(event: React.MouseEvent<HTMLLIElement>): void {
    setSortAnchorEl(event.currentTarget);
  }

  function handleAddSubTask(): void {
    addSubTask('Untitled');
  }

  function handleClose(): void {
    setAnchorEl(null);
  }

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
        <MenuItem onClick={handleSortMenuClick}>
          <ListItemIcon>
            <MenuIcon />
          </ListItemIcon>
          <ListItemText primary="Sort By" />
        </MenuItem>
        <MenuItem onClick={handleAddSubTask}>
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Add SubTask" />
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon />
          </ListItemIcon>
          <ListItemText primary="Delete" />
        </MenuItem>
        <MenuItem onClick={handleAddSubTask}>Add SubTask</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        <MenuItem
          onClick={() => {
            openPrereqTaskDialog();
            setAnchorEl(null);
          }}
        >
          Prerequisites
        </MenuItem>
      </Menu>
      <SortMenu
        sortBy={sortBy}
        setSortBy={setSortBy}
        anchorEl={sortAnchorEl}
        setAnchorEl={setSortAnchorEl}
      />
    </div>
  );
}

export default TaskMenu;
