import React, { useState, useEffect } from 'react';
import { Checkbox } from '@material-ui/core';
import Completables, { CompletableType } from '../../../models/Completables';
import Completable from '../../../models/Completable';

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
    Completables.setAndSave(completableType, completable);
  }

  const listenerId = `${completable._id}.CompletedCheckbox`;

  const [checked, setChecked] = useState(completable.completed);

  useEffect(() => {
    Completables.addPropertyListener(
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
      Completables.removePropertyListener(
        completableType,
        completable._id,
        listenerId,
        'completed'
      );
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    Completables.setAndSaveProperty(
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
