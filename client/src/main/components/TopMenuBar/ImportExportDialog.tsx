import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';

export type ImportExportDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function ImportExportDialog(props: ImportExportDialogProps) {
  const { open, setOpen } = props;

  function handleClose() {
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="import-export-dialog-title"
    >
      <DialogTitle id="import-export-dialog-title">Import / Export</DialogTitle>
      <DialogContent dividers />
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportExportDialog;
