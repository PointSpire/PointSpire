import React, { useState } from 'react';
import { IconButton, Tooltip } from '@material-ui/core';
import FilterListIcon from '@material-ui/icons/FilterList';
import FilterDialog from './FilterDialog';

export interface FilterButtonProps {
  className?: string;
}

function FilterButton(props: FilterButtonProps) {
  const { className } = props;
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleClick() {
    setDialogOpen(true);
  }

  return (
    <>
      <div className={className}>
        <Tooltip title="Filter" aria-label="filter">
          <IconButton onClick={handleClick}>
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      </div>
      <FilterDialog open={dialogOpen} setOpen={setDialogOpen} />
    </>
  );
}

export default FilterButton;
