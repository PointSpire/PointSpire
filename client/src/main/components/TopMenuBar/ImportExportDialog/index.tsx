import React from 'react';
import Debug from 'debug';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
} from '@material-ui/core';
import ImportBackupButton from './ImportBackupButton';
import SaveBackupButton from './SaveBackupButton';
import { AlertFunction } from '../../../App';

const debug = Debug('ImportExportDialog');
debug.enabled = false;

export type ImportExportDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  alert: AlertFunction;
};

function ImportExportDialog(props: ImportExportDialogProps) {
  const { open, setOpen, alert } = props;

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
      <DialogContent dividers>
        <List>
          <ListItem>
            <ImportBackupButton alert={alert} />
          </ListItem>
          <ListItem>
            <SaveBackupButton />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default ImportExportDialog;
