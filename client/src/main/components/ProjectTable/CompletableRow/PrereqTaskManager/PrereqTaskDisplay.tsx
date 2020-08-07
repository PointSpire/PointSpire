import React, { useState, useEffect } from 'react';
import { Button, Tooltip } from '@material-ui/core';
import { CompletableType } from '../../../../utils/dbTypes';
import UserData from '../../../../clientData/UserData';

export interface PrereqTaskDisplay2Props {
  completableId: string;
  completableType: CompletableType;
  openPrereqTaskDialog: () => void;
}

const PrereqTaskDisplay = (props: PrereqTaskDisplay2Props): JSX.Element => {
  const { completableId, completableType, openPrereqTaskDialog } = props;
  const completable = UserData.getCompletable(completableType, completableId);

  const [disabled, setDisabled] = useState(completable.completed);

  const completedListenerId = `${completableId}.prereqDisplay.completed`;

  /**
   * Add the property listener for the completed value so that it disables
   * the text input when the completable is completed.
   */
  useEffect(() => {
    UserData.addCompletablePropertyListener(
      completableType,
      completableId,
      completedListenerId,
      'completed',
      updatedValue => {
        setDisabled(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup(): void {
      UserData.removeCompletablePropertyListener(
        completableType,
        completableId,
        completedListenerId,
        'completed'
      );
    };
  }, []);

  return (
    <Tooltip title="Open Prerequisites">
      <Button
        disabled={disabled}
        variant="outlined"
        onClick={openPrereqTaskDialog}
      >
        {`Prereqs ${
          completable.prereqTasks ? completable.prereqTasks.length : 0
        }`}
      </Button>
    </Tooltip>
  );
};

export default PrereqTaskDisplay;
