import React, { useState } from 'react';
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Divider,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from '@material-ui/core';
import User from '../../../models/User';

export interface FilterDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function FilterDialog(props: FilterDialogProps) {
  const { open, setOpen } = props;
  const [filters, setFilters] = useState(User.get().filters);

  function saveFilters() {
    User.setAndSaveProperty('filters', { ...filters });
  }

  function handleClose() {
    saveFilters();
    setOpen(false);
  }

  function handleTagCheckboxClick(event: React.ChangeEvent<HTMLInputElement>) {
    const tagIndex = filters.tagIdsToShow.indexOf(event.target.name);
    if (tagIndex === -1) {
      filters.tagIdsToShow.push(event.target.name);
    } else {
      filters.tagIdsToShow.splice(tagIndex, 1);
    }
    setFilters({ ...filters });
  }

  function handleOptionsCheckboxClick(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    if (filters[event.target.name] !== undefined) {
      filters[event.target.name] = event.target.checked;
      setFilters({ ...filters });
    }
  }

  /**
   * This doesn't need to be subscribed to because this will load each time the
   * dialog comes up.
   */
  const userTags = User.get().currentTags;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="filter-dialog-title"
    >
      <DialogTitle id="filter-dialog-title">Filters</DialogTitle>
      <DialogContent dividers>
        <Typography variant="caption" component="span">
          Projects and Tasks
        </Typography>
        <FormGroup>
          <FormControlLabel
            label="Show Completed"
            control={
              <Checkbox
                checked={filters.showCompletedTasks}
                onChange={handleOptionsCheckboxClick}
                name="showCompletedTasks"
              />
            }
          />
          <FormControlLabel
            label="Show Future Start Dates"
            control={
              <Checkbox
                checked={filters.showFutureStartDates}
                onChange={handleOptionsCheckboxClick}
                name="showFutureStartDates"
              />
            }
          />
        </FormGroup>
        <Divider />
        <Typography variant="caption" component="span">
          Tags
        </Typography>
        <FormGroup>
          {Object.entries(userTags).map(([tagId, userTag]) => (
            <FormControlLabel
              key={tagId}
              control={
                <Checkbox
                  checked={filters.tagIdsToShow.includes(tagId)}
                  onChange={handleTagCheckboxClick}
                  name={tagId}
                />
              }
              label={userTag.name}
            />
          ))}
        </FormGroup>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Done</Button>
      </DialogActions>
    </Dialog>
  );
}

export default FilterDialog;
