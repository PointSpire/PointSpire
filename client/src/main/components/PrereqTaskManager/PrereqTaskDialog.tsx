import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogActions,
  createStyles,
  Theme,
  Typography,
  WithStyles,
  withStyles,
  Button,
} from '@material-ui/core';
import { CompletableType } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';
import PrereqTaskManager from '.';

function styles(theme: Theme) {
  return createStyles({
    root: {
      background: theme.palette.background.default,
    },
    title: {
      background: theme.palette.primary.main,
    },
    content: {
      background: theme.palette.background.default,
    },
  });
}

export interface PrereqTaskDialogProps extends WithStyles<typeof styles> {
  savePrereqId: string;
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
  const {
    classes,
    openDialog,
    completableId,
    completableType,
    closeDialog,
  } = props;
  const [completable, setCompletable] = useState(
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
            '\nCompletable Updated.'
          );
          setCompletable(updatedCompletable);
        }
      }
    );

    return function cleanup() {
      UserData.removeCompletableListener(
        completableType,
        completableId,
        listenerId
      );
    };
  }, []);

  const closeAndSave = () => {
    const updatedCompletable = completable;
    updatedCompletable.prereqTasks = currentPrereqs;
    UserData.setAndSaveCompletable(completableType, updatedCompletable);
    setCompletable(updatedCompletable);
    closeDialog();
  };

  return (
    <Dialog maxWidth="lg" open={openDialog} onClose={closeDialog}>
      <DialogTitle className={classes.title}>
        Prerequisite Tasks Menu
      </DialogTitle>
      <DialogContent className={classes.content}>
        <Typography align="center">{completable.title}</Typography>
        <PrereqTaskManager
          // completableId={completableId}
          // completableType={completableType}
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

export default withStyles(styles, { withTheme: true })(PrereqTaskDialog);
