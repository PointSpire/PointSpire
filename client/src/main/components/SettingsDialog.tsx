import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

type SettingsDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

export default function SettingsDialog(
  props: SettingsDialogProps
): JSX.Element {
  const { setOpen, open } = props;

  const handleClose = () => {
    setOpen(false);
  };

  const handleSave = () => {
    setOpen(false);
    // Save their settings
  };

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
          Some settings here
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="primary">
          Save Settings
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
