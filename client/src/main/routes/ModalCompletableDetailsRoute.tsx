import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Dialog } from '@material-ui/core';
import CompletableDetails from '../components/CompletableDetails';

function CompleteableDetailsRoute() {
  const { completableType, completableId = '' } = useParams();
  const history = useHistory();

  function handleClose() {
    history.push('/');
  }

  return (
    <Dialog
      open={completableId !== ''}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
    >
      <CompletableDetails
        completableType={completableType}
        completableId={completableId}
      />
    </Dialog>
  );
}

export default CompleteableDetailsRoute;
