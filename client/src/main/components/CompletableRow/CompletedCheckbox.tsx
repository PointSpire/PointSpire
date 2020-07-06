import React, { useState } from 'react';
import { Checkbox } from '@material-ui/core';
import { Project, Task } from '../../logic/dbTypes';

export type CompletedCheckboxProps = {
  className?: string;
  completable: Project | Task;
  setAndScheduleSave: (completable: Project | Task) => void;
};

function CompletedCheckbox(props: CompletedCheckboxProps) {
  const { className, completable, setAndScheduleSave } = props;

  /* Convert the project's completed boolean if needed. This isn't a very
  efficient way to do this, but it only happens once for each project
  that doesn't have a valid `completed` property yet. */
  if (typeof completable.completed !== 'boolean') {
    completable.completed = false;
    setAndScheduleSave(completable);
  }

  const [checked, setChecked] = useState(completable.completed);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setChecked(event.target.checked);
    const newCompletable = { ...completable };
    newCompletable.completed = event.target.checked;
    if (newCompletable.completed) {
      newCompletable.completedDate = new Date();
    } else {
      newCompletable.completedDate = null;
    }
    setAndScheduleSave(newCompletable);
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
