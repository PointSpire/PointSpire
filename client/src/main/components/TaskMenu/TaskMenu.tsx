import React, { useState, MouseEvent } from 'react';
import { IconButton, Menu, MenuItem } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import SortMenu from './SortMenu';

export type TaskMenuProps = {
  deleteTask: () => void;
  addSubTask: (title: string) => Promise<void>;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  openPrereqTaskDialog?: (
    e: MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
  clickProp?: boolean;
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
    clickProp = true,
  } = props;

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [sortAnchorEl, setSortAnchorEl] = useState<HTMLElement | null>(null);

  function handleDelete(): void {
    deleteTask();
  }

  function handleClick(event: React.MouseEvent<HTMLButtonElement>): void {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  }

  function handleSortMenuClick(event: React.MouseEvent<HTMLLIElement>): void {
    if (!clickProp) {
      // Prevent click event propagation
      event.stopPropagation();
    }
    setSortAnchorEl(event.currentTarget);
  }

  function handleAddSubTask(): void {
    addSubTask('Untitled').catch(err => {
      // eslint-disable-next-line
      console.error(err);
    });
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
          {'< '}
          Sort By
        </MenuItem>
        <MenuItem onClick={handleAddSubTask}>Add SubTask</MenuItem>
        <MenuItem onClick={handleDelete}>Delete</MenuItem>
        {openPrereqTaskDialog ? (
          <MenuItem
            onClick={event => {
              openPrereqTaskDialog(event, null);
              setAnchorEl(null);
            }}
          >
            Prerequisites
          </MenuItem>
        ) : (
          ''
        )}
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
