import React, { useState, useEffect } from 'react';
import {
  Button,
  WithStyles,
  createStyles,
  withStyles,
  InputLabel,
} from '@material-ui/core';
import PriorityDialog from './PriorityDialog';
import { CompletableType } from '../../utils/dbTypes';
import UserData from '../../ClientData/UserData';

function styles() {
  return createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
  });
}

export interface PriorityButtonProps extends WithStyles<typeof styles> {
  completableId: string;
  completableType: CompletableType;
}

/**
 * Represents the button for setting a priority on a task or project. This
 * component contains all the logic needed to carry out its operations as long
 * as the props are provided.
 *
 * The display of the button is currently hard-coded to be a small "Priority"
 * title with the button below it set to the current priority.
 *
 * @param {PriorityButtonProps} props the props
 */
function PriorityButton(props: PriorityButtonProps): JSX.Element {
  const { classes, completableId, completableType } = props;
  const [open, setOpen] = useState(false);

  const initialCompletable = UserData.getCompletable(
    completableType,
    completableId
  );

  const [disabled, setDisabled] = useState(initialCompletable.completed);
  const [priority, setPriority] = useState(initialCompletable.priority);

  function handleClick(): void {
    setOpen(true);
  }

  /**
   * The ID for this listener when set on some property or completable.
   */
  const listenerId = `${completableId}.PriorityButton.priority`;

  /**
   * Add the property listener for the completed value so that it disables
   * the priority button when the completable is completed.
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

  /**
   * Add the property listener for the priority value.
   */
  useEffect(() => {
    UserData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      'priority',
      updatedValue => {
        setPriority(updatedValue as number);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      UserData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        'priority'
      );
    };
  }, []);

  return (
    <div className={classes.root}>
      <InputLabel shrink>Priority</InputLabel>
      <Button variant="outlined" onClick={handleClick} disabled={disabled}>
        {priority}
      </Button>
      <PriorityDialog
        open={open}
        setOpen={setOpen}
        completableId={completableId}
        completableType={completableType}
      />
    </div>
  );
}

export default withStyles(styles, { withTheme: false })(PriorityButton);
