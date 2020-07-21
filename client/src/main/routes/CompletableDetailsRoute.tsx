import React from 'react';
import { useParams } from 'react-router-dom';
import CompletableDetails from '../components/CompletableDetails';

function CompleteableDetailsRoute() {
  const { completableType, completableId } = useParams();

  return (
    <CompletableDetails
      completableType={completableType}
      completableId={completableId}
    />
  );
}

export default CompleteableDetailsRoute;
