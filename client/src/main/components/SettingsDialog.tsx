import React from 'react';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import { Typography, Button, Dialog } from '@material-ui/core';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function SettingsDialog(
  props: SettingsDialogProps
): JSX.Element {
  const { setOpen, open } = props;

  function handleClose(): void {
    setOpen(false);
  }

  function handleSave(): void {
    setOpen(false);
    // Save their settings
  }

  const descriptionElementRef = React.useRef<HTMLElement>(null);
  React.useEffect(() => {
    if (open) {
      const { current: descriptionElement } = descriptionElementRef;
      if (descriptionElement !== null) {
        descriptionElement.focus();
      }
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="settings-dialog-title"
      aria-describedby="settings-dialog-description"
    >
      <DialogTitle id="settings-dialog-title">Settings</DialogTitle>
      <DialogContent dividers>
        <DialogContentText
          id="settings-dialog-description"
          ref={descriptionElementRef}
          tabIndex={-1}
        >
          <Typography variant="h4" component="h2">
            Something
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
