import React, { useState, useEffect } from 'react';
import { Checkbox } from '@material-ui/core';
import { CompletableType, Completable } from '../../../utils/dbTypes';
import UserData from '../../../clientData/UserData';

export type CompletedCheckboxProps = {
  className?: string;
  completable: Completable;
  completableType: CompletableType;
  clickProp?: boolean;
};

function CompletedCheckbox(props: CompletedCheckboxProps) {
  const { className, completable, completableType, clickProp = true } = props;

  /* Convert the project's completed boolean if needed. This isn't a very
  efficient way to do this, but it only happens once for each project
  that doesn't have a valid `completed` property yet. */
  if (typeof completable.completed !== 'boolean') {
    completable.completed = false;
    UserData.setAndSaveCompletable(completableType, completable);
  }

  const listenerId = `${completable._id}.CompletedCheckbox`;

  const [checked, setChecked] = useState(completable.completed);

  useEffect(() => {
    UserData.addCompletablePropertyListener(
      completableType,
      completable._id,
      listenerId,
      'completed',
      updatedValue => {
        setChecked(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      UserData.removeCompletablePropertyListener(
        completableType,
        completable._id,
        listenerId,
        'completed'
      );
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    UserData.setAndSaveCompletableProperty(
      completableType,
      completable._id,
      'completed',
      event.target.checked
    );
  }

  // Prevent click propagation for mobile UI
  function handleClick(event: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    if (!clickProp) {
      event.stopPropagation();
    }
  }

  return (
    <Checkbox
      key={completable._id}
      className={className}
      checked={checked}
      onChange={handleChange}
      onClick={handleClick}
      color="primary"
      size="medium"
    />
  );
}

export default CompletedCheckbox;
