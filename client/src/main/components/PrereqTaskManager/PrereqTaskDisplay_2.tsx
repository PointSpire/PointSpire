import React, { MouseEvent } from 'react';
import { Button, Tooltip } from '@material-ui/core';
import { CompletableType } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';

export interface PrereqTaskDisplay2Props {
  completableId: string;
  completableType: CompletableType;
  openPrereqTaskDialog: (
    e: MouseEvent<HTMLElement>,
    prereqs: string[] | null
  ) => void;
}

const PrereqTaskDisplay2 = (props: PrereqTaskDisplay2Props): JSX.Element => {
  const { completableId, completableType, openPrereqTaskDialog } = props;
  const completable = UserData.getCompletable(completableType, completableId);
  return (
    <Tooltip title="Open Prerequisites">
      <Button variant="outlined" onClick={e => openPrereqTaskDialog(e, null)}>
        {`Test ${
          completable.prereqTasks ? completable.prereqTasks.length : '0'
        }`}
      </Button>
    </Tooltip>
  );
};

export default PrereqTaskDisplay2;
