import React from 'react';
import { Button } from '@material-ui/core';
import { CompletableType } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';

export interface PrereqTaskDisplayProps {
  completableId: string;
  completableType: CompletableType;
}

const PrereqTaskDisplay = (props: PrereqTaskDisplayProps): JSX.Element => {
  const { completableId, completableType } = props;
  const completable = UserData.getCompletable(completableType, completableId);
  return (
    <Button variant="outlined">
      {`Test ${completable.prereqTasks ? completable.prereqTasks.length : '0'}`}
    </Button>
  );
};

export default PrereqTaskDisplay;
