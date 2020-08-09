import React, { useState, MouseEvent } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import MenuIcon from '@material-ui/icons/Menu';
import { useHistory } from 'react-router-dom';
import SortMenu from './SortMenu';
import { MobileContext } from '../../../../utils/contexts';
import { CompletableType } from '../../../../models/Completables';

export type TaskMenuProps = {
  deleteTask: () => void;
  addSubTask: (title: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  openPrereqTaskDialog?: (
    e: MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
  clickProp?: boolean;
  completableId: string;
  completableType: CompletableType;
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
    completableType,
    completableId,
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

  function handleClose(): void {
    setAnchorEl(null);
  }

  function handleAddSubTask(): void {
    addSubTask('Untitled');
    handleClose();
  }

  const history = useHistory();

  function handleEdit(): void {
    history.push(`/c/${completableType}/${completableId}`);
    handleClose();
  }

  return (
    <MobileContext.Consumer>
      {mobile => (
        <>
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
            {mobile ? (
              <MenuItem onClick={handleEdit} key="edit">
                <ListItemIcon>
                  <EditIcon />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
            ) : (
              [
                <MenuItem onClick={handleSortMenuClick} key="sortBy">
                  <ListItemIcon>
                    <MenuIcon />
                  </ListItemIcon>
                  <ListItemText primary="Sort By" />
                </MenuItem>,
                <MenuItem onClick={handleAddSubTask} key="add">
                  <ListItemIcon>
                    <AddIcon />
                  </ListItemIcon>
                  <ListItemText primary="Add SubTask" />
                </MenuItem>,
              ]
            )}

            <MenuItem onClick={handleDelete} key="delete">
              <ListItemIcon>
                <DeleteIcon />
              </ListItemIcon>
              <ListItemText primary="Delete" />
            </MenuItem>
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
        </>
      )}
    </MobileContext.Consumer>
  );
}

export default TaskMenu;
