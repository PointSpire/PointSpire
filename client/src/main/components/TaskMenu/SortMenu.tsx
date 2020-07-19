import React from 'react';
import { MenuItem, Menu } from '@material-ui/core';
import sortingFunctions from '../../utils/sortingFunctions';

export type SortMenuProps = {
  anchorEl: HTMLElement | null;
  setAnchorEl: (anchorEl: HTMLElement | null) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
};

/**
 * Represents the small menu that pops up with sorting options from another
 * menu.
 *
 * @param {SortMenuProps} props the props
 */
function SortMenu(props: SortMenuProps): JSX.Element {
  const { sortBy, setSortBy, anchorEl, setAnchorEl } = props;

  function handleClose(): void {
    setAnchorEl(null);
  }

  function handleClick(newSortBy: string) {
    return (): void => {
      setSortBy(newSortBy);
      handleClose();
    };
  }

  return (
    <Menu
      anchorEl={anchorEl}
      open={Boolean(anchorEl)}
      getContentAnchorEl={null}
      anchorOrigin={{ vertical: 'center', horizontal: 'left' }}
      transformOrigin={{ vertical: 'center', horizontal: 'right' }}
      onClose={handleClose}
    >
      {Object.keys(sortingFunctions).map(sortType => {
        return (
          <MenuItem
            key={sortType}
            selected={sortBy === sortType}
            onClick={handleClick(sortType)}
          >
            {sortType}
          </MenuItem>
        );
      })}
    </Menu>
  );
}

export default SortMenu;
