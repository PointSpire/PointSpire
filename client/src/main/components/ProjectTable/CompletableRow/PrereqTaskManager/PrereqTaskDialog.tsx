import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  Button,
} from '@material-ui/core';
import { CompletableType } from '../../../../utils/dbTypes';
import UserData from '../../../../clientData/UserData';
import PrereqTaskManager from '.';
import Task from '../../../../models/Task';

export interface PrereqTaskDialogProps {
  completableId: string;
  completableType: CompletableType;
  openDialog: boolean;
  closeDialog: () => void;
}

/**
 * Handles opening the prerequisite tasks in a dialog box.
 * @param {PrereqTaskDialogProps} props PrereqTaskDialog properties.
 */
const PrereqTaskDialog = (props: PrereqTaskDialogProps): JSX.Element => {
  const { openDialog, completableId, completableType, closeDialog } = props;
  const [completable, setCompletable] = useState<Task>(
    UserData.getCompletable(completableType, completableId)
  );
  const [currentPrereqs, setPrereqs] = useState<string[]>(
    completable.prereqTasks
  );
  const listenerId = `${completableId}-PrereqDialog`;

  useEffect(() => {
    UserData.addCompletableListener(
      completableType,
      completableId,
      listenerId,
      updatedCompletable => {
        if (updatedCompletable) {
          // eslint-disable-next-line
          console.log(
            'Completable ID: ',
            updatedCompletable._id,
            '\nCompletable Prerequisites Updated.'
          );
          setCompletable(updatedCompletable);
        }
      }
    );

    return function cleanup(): void {
      UserData.removeCompletableListener(
        completableType,
        completableId,
        listenerId
      );
    };
  }, []);

  /**
   * Saves the prereqs when the 'save' button is pressed.
   */
  const closeAndSave = (): void => {
    const updatedCompletable = completable;
    updatedCompletable.prereqTasks = currentPrereqs;
    UserData.setAndSaveCompletable(completableType, updatedCompletable);
    setCompletable(updatedCompletable);
    closeDialog();
  };

  return (
    <Dialog maxWidth="lg" open={openDialog} onClose={closeDialog}>
      <DialogTitle>
        {`Prerequisite Tasks for ${completableType}` +
          ` "${completable.title}"`}
      </DialogTitle>
      <DialogContent dividers>
        <PrereqTaskManager
          currentPrereqs={currentPrereqs}
          updatePrereqs={newPrereqs => setPrereqs(newPrereqs)}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={closeDialog}>
          Cancel
        </Button>
        <Button variant="text" onClick={closeAndSave}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PrereqTaskDialog;
