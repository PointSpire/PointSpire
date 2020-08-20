import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Dialog, DialogActions, Button } from '@material-ui/core';
import CompletableDetails from './CompletableDetails';

function CompletableDetailsModal() {
  const { completableType, completableId } = useParams();
  const history = useHistory();

  function handleClose() {
    history.push('/');
  }

  return (
    <Dialog open fullWidth maxWidth="md" onClose={handleClose}>
      <CompletableDetails
        completableType={completableType}
        completableId={completableId}
      />
      <DialogActions>
        <Button onClick={() => handleClose()} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default CompletableDetailsModal;
