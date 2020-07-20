import React, { MouseEvent, useState, useEffect } from 'react';
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

  const [disabled, setDisabled] = useState(completable.completed);

  const listenerId = `${completableId}.prereqDisplayButton.completed`;

  /**
   * Add the property listener for the completed value so that it disables
   * the text input when the completable is completed.
   */
  useEffect(() => {
    UserData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      'completed',
      updatedValue => {
        setDisabled(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      UserData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        'completed'
      );
    };
  }, []);

  return (
    <Tooltip title="Open Prerequisites">
      <Button
        disabled={disabled}
        variant="outlined"
        onClick={e => openPrereqTaskDialog(e, null)}
      >
        {`Prereqs ${
          completable.prereqTasks ? completable.prereqTasks.length : '0'
        }`}
      </Button>
    </Tooltip>
  );
};

export default PrereqTaskDisplay2;
