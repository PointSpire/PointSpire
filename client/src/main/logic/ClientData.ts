import {
  ProjectObjects,
  TaskObjects,
  Completable,
  Project,
  CompletableType,
} from './dbTypes';

type CompletableListeners = {
  [completableId: string]: {
    [listenerId: string]: (completable: Completable) => void;
  };
};

class ClientData {
  private static projects: ProjectObjects;

  private static tasks: TaskObjects;

  private static projectListeners: CompletableListeners;

  private static taskListeners: CompletableListeners;

  /**
   * Notifies and runs all the callbacks for the associated completable.
   *
   * @param {CompletableType} type the type of the completable
   * @param {Completable} updatedCompletable the updated completable
   */
  private static notifyCompletableListeners(
    type: CompletableType,
    updatedCompletable: Completable
  ) {
    let completableListeners;
    if (type === 'project') {
      completableListeners = this.projectListeners;
    } else {
      completableListeners = this.taskListeners;
    }
    Object.values(completableListeners[updatedCompletable._id]).forEach(
      callback => {
        callback(updatedCompletable);
      }
    );
  }

  private static setCompletable(
    type: 'project' | 'task',
    completable: Completable
  ) {
    if (type === 'project') {
      this.projects[completable._id] = completable;
    } else {
      this.tasks[completable._id] = completable;
    }
    this.notifyCompletableListeners(type, completable);
  }

  static setProjects(projects: ProjectObjects): void {
    this.projects = projects;
  }

  static setProject(project: Project) {
    this.setCompletable('project', project);
  }
}

export default ClientData;
