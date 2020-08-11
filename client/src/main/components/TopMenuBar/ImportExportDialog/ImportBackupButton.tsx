import React, { useState } from 'react';
import Debug from 'debug';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
} from '@material-ui/core';
import { AlertFunction } from '../../../App';
import { postUserImport } from '../../../utils/fetchMethods';
import User from '../../../models/User';

const debug = Debug('ImportBackupButton.tsx');
debug.enabled = true;

export type ImportBackupButtonProps = {
  alert: AlertFunction;
};

/**
 * Holds the functionality for importing a backup file. Also includes a dialog
 * that displays any errors that came up during validation.
 *
 * @param {ImportBackupButtonProps} props the props for the component
 */
function ImportBackupButton(props: ImportBackupButtonProps) {
  const { alert } = props;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [errString, setErrString] = useState('');

  async function parseJson(file: File): Promise<object | null> {
    try {
      const parsedObj = JSON.parse(await file.text());
      return parsedObj;
    } catch (err) {
      debug(err);
      alert('error', 'Import Failed: JSON file had invalid syntax');
      return null;
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    debug('handleFileChange triggered');
    const fileInput = event.target;
    let parsedObj: object | null = null;
    if (fileInput.files && fileInput.files[0]) {
      parsedObj = await parseJson(fileInput.files[0]);
      debug(parsedObj);
    } else {
      return;
    }
    if (parsedObj === null) {
      return;
    }

    // Send the parsedObj to the server
    const result = await postUserImport(User.get()._id, parsedObj);
    if (result.valid) {
      window.location.reload();
    } else {
      setErrString(JSON.stringify(result.err, null, 2));
      setDialogOpen(true);
    }
  }

  function handleClose() {
    setDialogOpen(false);
  }

  return (
    <>
      <Button color="primary" variant="contained" component="label">
        Import Backup
        <input
          onChange={handleFileChange}
          accept=".json"
          type="file"
          style={{ display: 'none' }}
        />
      </Button>
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="import-error-dialog-title"
      >
        <DialogTitle id="import-error-dialog-title">
          Failed to Import
        </DialogTitle>
        <DialogContent dividers>
          <Typography>{errString}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ImportBackupButton;
