import React from 'react';
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    // eslint-disable-next-line
    console.log(
      'The checkbox was changed and its value is now:',
      event.target.checked
    );
    completable.completed = event.target.checked;
    if (completable.completed) {
      completable.completedDate = new Date();
    } else {
      completable.completedDate = null;
    }
    setAndScheduleSave(completable);
  }

  return (
    <Checkbox
      key={completable._id}
      className={className}
      checked={completable.completed}
      onChange={handleChange}
      color="primary"
      size="medium"
    />
  );
}

export default CompletedCheckbox;
