import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GitHubIcon from '@material-ui/icons/GitHub';

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

  // function handleSave(): void {
  //   setOpen(false);
  //   // Save their settings
  // }

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
      <DialogTitle id="settings-dialog-title">Login Providers</DialogTitle>
      <DialogContent dividers>
        <Button
          variant="contained"
          startIcon={<GitHubIcon />}
          onClick={() => {
            window.open(
              'https://point-spire.herokuapp.com/auth/github',
              '_self'
            );
          }}
        >
          Login With Github
        </Button>
      </DialogContent>
    </Dialog>
  );
}
