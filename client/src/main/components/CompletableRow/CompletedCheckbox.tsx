import React, { useState, useEffect } from 'react';
import { Checkbox } from '@material-ui/core';
import {
  Project,
  Task,
  CompletableType,
  Completable,
} from '../../logic/dbTypes';
import ClientData from '../../logic/ClientData';

export type CompletedCheckboxProps = {
  className?: string;
  completable: Completable;
  completableType: CompletableType;
  setAndScheduleSave: (completable: Project | Task) => void;
};

function CompletedCheckbox(props: CompletedCheckboxProps) {
  const { className, completable, setAndScheduleSave, completableType } = props;

  /* Convert the project's completed boolean if needed. This isn't a very
  efficient way to do this, but it only happens once for each project
  that doesn't have a valid `completed` property yet. */
  if (typeof completable.completed !== 'boolean') {
    completable.completed = false;
    setAndScheduleSave(completable);
  }

  const listenerId = `${completable._id}.CompletedCheckbox`;

  const [checked, setChecked] = useState(completable.completed);

  useEffect(() => {
    ClientData.addCompletablePropertyListener(
      completableType,
      completable._id,
      listenerId,
      'completed',
      updatedValue => {
        // eslint-disable-next-line
        console.log('Updated value triggered');
        setChecked(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      ClientData.removeCompletablePropertyListener(
        completableType,
        completable._id,
        listenerId,
        'completed'
      );
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    ClientData.setCompletableProperty(
      completableType,
      completable._id,
      'completed',
      event.target.checked
    );
  }

  return (
    <Checkbox
      key={completable._id}
      className={className}
      checked={checked}
      onChange={handleChange}
      color="primary"
      size="medium"
    />
  );
}

export default CompletedCheckbox;
