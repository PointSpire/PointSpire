import React from 'react';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import GitHubIcon from '@material-ui/icons/GitHub';

type LoginDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  githubClientId: string;
};

/**
 * Represents the login dialog, displaying login providers.
 *
 * @param {LoginDialogProps} props props passed to the LoginDialog
 */
export default function LoginDialog(props: LoginDialogProps): JSX.Element {
  const { setOpen, open, githubClientId } = props;

  /**
   * Handles the closing of the LoginDialog
   */
  function handleClose(): void {
    setOpen(false);
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
      <DialogTitle id="settings-dialog-title">Login Providers</DialogTitle>
      <DialogContent dividers>
        <Button
          variant="contained"
          startIcon={<GitHubIcon />}
          onClick={() => {
            window.open(
              `https://github.com/login/oauth/authorize?client_id=${githubClientId}&scope=user`,
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
