import React from 'react';
import Debug from 'debug';
import { Button } from '@material-ui/core';

const debug = Debug('ImportBackupButton.tsx');
debug.enabled = true;

function ImportBackupButton() {
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    debug('handleFileChange triggered');
    const fileInput = event.target;
    if (fileInput.files && fileInput.files[0]) {
      debug(fileInput.files[0].name);
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
