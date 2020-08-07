import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import {
  Assignment as AssignIcon,
  Add as AddIcon,
  Menu as MenuIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
} from '@material-ui/icons';
import SortMenu from './SortMenu';

export type TaskMenuProps = {
  sortBy: string;
  deleteTask: () => void;
  addSubTask: (title: string) => void;
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
    sortBy,
    deleteTask,
    addSubTask,
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

  function handleOpenPrereqs(): void {
    openPrereqTaskDialog();
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
        <MenuItem onClick={handleOpenPrereqs}>
          <ListItemIcon>
            <AssignIcon />
          </ListItemIcon>
          <ListItemText>Prerequisites</ListItemText>
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
