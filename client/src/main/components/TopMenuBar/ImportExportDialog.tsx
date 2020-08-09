import React from 'react';
import Debug from 'debug';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@material-ui/core';
import FileSaver from 'file-saver';

const debug = Debug('ImportExportDialog.tsx');
debug.enabled = true;

export type ImportExportDialogProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

function ImportExportDialog(props: ImportExportDialogProps) {
  const { open, setOpen } = props;

  function handleClose() {
    setOpen(false);
  }

  function get2DigitString(num: number): string {
    if (num < 10) {
      return `0${num}`;
    }
    return `${num}`;
  }

  function createDateString(): string {
    const date = new Date();
    return (
      `${date.getFullYear()}` +
      `${get2DigitString(date.getMonth() + 1)}` +
      `${get2DigitString(date.getDate())}` +
      `-${get2DigitString(date.getHours())}` +
      `${get2DigitString(date.getMinutes())}`
    );
  }

  function saveJsonFile() {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            someTestValue: 3,
            someOtherValue: 4,
          },
          null,
          2
        ),
      ],
      {
        type: 'application/jsoon;charset=utf-8',
      }
    );
    FileSaver.saveAs(blob, `${createDateString()} - pointspire-backup.json`);
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
        <Button onClick={saveJsonFile}>Save Backup of Data</Button>
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
