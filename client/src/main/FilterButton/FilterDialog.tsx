import React from 'react';
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
import UserData from '../clientData/UserData';

export interface FilterDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

function FilterDialog(props: FilterDialogProps) {
  const { open, setOpen } = props;

  function handleClose() {
    setOpen(false);
  }

  /**
   * This doesn't need to be subscribed to because this will load each time the
   * dialog comes up.
   */
  const tagNames = Object.values(UserData.getUser().currentTags).map(
    userTag => userTag.name
  );

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
        <Divider />
        <Typography variant="caption" component="span">
          Tags
        </Typography>
        <FormGroup>
          {tagNames.map(tagName => (
            <FormControlLabel
              key={tagName}
              control={<Checkbox />}
              label={tagName}
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
