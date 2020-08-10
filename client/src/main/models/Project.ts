import Completable from './Completable';
import { tasksAreEqual } from './Task';

export type ProjectObjects = {
  [id: string]: Project;
};

export function projectsAreEqual(
  project1: Project,
  project2: Project
): boolean {
  return tasksAreEqual(project1, project2);
}

/**
 * Represents a new Project. This mirrors the database version of a Project
 * completely.
 */
export default class Project extends Completable {}
