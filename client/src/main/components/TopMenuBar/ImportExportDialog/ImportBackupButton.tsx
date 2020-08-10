import React from 'react';
import Debug from 'debug';
import { Button } from '@material-ui/core';
import { AlertFunction } from '../../../App';

const debug = Debug('ImportBackupButton.tsx');
debug.enabled = true;

export type ImportBackupButtonProps = {
  alert: AlertFunction;
};

function ImportBackupButton(props: ImportBackupButtonProps) {
  const { alert } = props;

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
    let parsedObj: object | null;
    if (fileInput.files && fileInput.files[0]) {
      parsedObj = await parseJson(fileInput.files[0]);
      debug(parsedObj);

      // What happens next?
      // Make sure that certain properties exist.
      // Try to import the user object

      // Try to import the
    }
  }

  return (
    <Button color="primary" variant="contained" component="label">
      Import Backup
      <input
        onChange={handleFileChange}
        accept=".json"
        type="file"
        style={{ display: 'none' }}
      />
    </Button>
  );
}

export default ImportBackupButton;
