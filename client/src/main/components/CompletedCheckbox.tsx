import React from 'react';
import { Checkbox } from '@material-ui/core';
import { Project } from '../logic/dbTypes';
import scheduleCallback from '../logic/savingTimer';

export type CompletedCheckboxProps = {
  className?: string;
  project: Project;
  setProject: (project: Project) => void;
  saveProject(): void;
};

function CompletedCheckbox(props: CompletedCheckboxProps) {
  const { className, project, setProject, saveProject } = props;

  /* Convert the project's completed boolean if needed. This isn't a very
  efficient way to do this, but it only happens once for each project
  that doesn't have a valid `completed` property yet. */
  if (typeof project.completed !== 'boolean') {
    project.completed = false;
    setProject(project);
    scheduleCallback(`${project._id}.saveProject`, saveProject);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    project.completed = event.target.checked;
    if (project.completed) {
      project.completedDate = new Date();
    } else {
      project.completedDate = null;
    }
    setProject(project);
    scheduleCallback(`${project._id}.saveProject`, saveProject);
  }

  return (
    <Checkbox
      key={project._id}
      className={className}
      checked={project.completed}
      onChange={handleChange}
      color="primary"
      size="medium"
    />
  );
}

export default CompletedCheckbox;
