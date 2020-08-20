import React, { useState, useEffect } from 'react';
import Debug from 'debug';
import { Breadcrumbs, Link } from '@material-ui/core';
import { useHistory } from 'react-router-dom';
import Completables, { CompletableType } from '../models/Completables';
import Completable from '../models/Completable';

const debug = Debug('BreadCrumb.tsx');
debug.enabled = false;

type ParentCompletables = Array<{
  link: string;
  title: string;
}>;

type BreadCrumbProps = {
  completableId: string;
  completableType: CompletableType;
};

function BreadCrumb(props: BreadCrumbProps) {
  const { completableId, completableType } = props;

  const history = useHistory();

  /**
   * Finds the parent of a task and returns the type, and id of that parent.
   *
   * @param {string} id the ID of the task to find the parent for
   */
  function findParentOf(
    id: string
  ): {
    type: CompletableType;
    completable: Completable;
  } {
    const parentTask = Object.values(Completables.getTasks()).find(task =>
      task.subtasks.includes(id)
    );
    if (parentTask) {
      return {
        type: 'task',
        completable: parentTask,
      };
    }
    const parentProject = Object.values(
      Completables.getProjects()
    ).find(project => project.subtasks.includes(id));
    if (!parentProject) {
      throw new Error('Parent not found for task');
    }
    return {
      type: 'project',
      completable: parentProject,
    };
  }

  // Build the orderedParents
  const orderedParents: ParentCompletables = [];
  if (completableType !== 'project') {
    let currentParentType = 'task';
    let currentParent = Completables.get(completableType, completableId);
    while (currentParentType !== 'project') {
      const returnedParentData = findParentOf(currentParent._id);
      currentParent = returnedParentData.completable;
      currentParentType = returnedParentData.type;
      orderedParents.unshift({
        link: `/c/${currentParentType}/${currentParent._id}`,
        title: currentParent.title,
      });
    }
  }

  // Add the root path at the beginning of the orderedParents
  orderedParents.unshift({
    link: '/',
    title: 'Home',
  });

  debug('orderedParents is: ', orderedParents);

  const [title, setTitle] = useState(
    Completables.get(completableType, completableId).title
  );

  const listenerId = `${completableId}.BreadCrumb`;

  /**
   * Subscribe to changes in the title
   */
  useEffect(() => {
    Completables.addPropertyListener(
      completableType,
      completableId,
      listenerId,
      'title',
      newTitle => {
        setTitle(newTitle as string);
      }
    );

    return () => {
      Completables.removePropertyListener(
        completableType,
        completableId,
        listenerId,
        'title'
      );
    };
  }, []);

  /**
   * Creates a function which will route the user to the specified `to`
   * location, and remove the correct number of entries from
   * `parentCompletables` in the `LocationState`.
   *
   * @param {string} to the address relative to the host. For example `/` to
   * go back to the main page.
   */
  function handleClick(to: string) {
    return (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      event.preventDefault();
      debug('pushing the following "to" value to history', to);
      history.push(to);
    };
  }

  return (
    <Breadcrumbs>
      {orderedParents.map(({ link, title: parentTitle }) => (
        <Link href={link} onClick={handleClick(link)} key={link}>
          {parentTitle}
        </Link>
      ))}
      <div>{title}</div>
    </Breadcrumbs>
  );
}

export default BreadCrumb;
