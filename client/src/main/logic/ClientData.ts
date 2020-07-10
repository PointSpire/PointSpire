import {
  ProjectObjects,
  TaskObjects,
  Completable,
  Project,
  CompletableType,
  Task,
} from './dbTypes';
import scheduleCallback from './savingTimer';
import { patchProject, patchTask } from './fetchMethods';

/**
 * The callback which will be called if any changes are made to a Completable.
 * If the completable is deleted, then null is passed to the callback.
 */
export type ListenerCallback = (completable: Completable | null) => void;

export type PropertyListenerCallback = (updatedValue: unknown) => void;

type CompletableListeners = {
  [completableId: string]: {
    listeners: {
      [listenerId: string]: ListenerCallback;
    };
    propertyListeners: {
      [propertyName: string]: {
        [listenerId: string]: PropertyListenerCallback;
      };
    };
  };
};

/**
 * Holds the data and operations on the data that needs to be held in RAM for
 * the client but should not be held in state. It also provides methods of
 * adding listeners to this data.
 */
class ClientData {
  // #region Private Variables
  private static projects: ProjectObjects;

  private static tasks: TaskObjects;

  private static projectListeners: CompletableListeners = {};

  private static taskListeners: CompletableListeners = {};
  // #endregion

  // #region Private Methods
  /**
   * Notifies and runs all the callbacks for the associated completable.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {Completable | null} updatedCompletable the updated completable or
   * null if the completable was deleted
   */
  private static notifyCompletableListeners(
    type: CompletableType,
    completableId: string,
    updatedCompletable: Completable | null
  ) {
    const completableListeners = this.getCompletableListeners(type);
    if (completableListeners[completableId]) {
      Object.values(completableListeners[completableId].listeners).forEach(
        callback => {
          callback(updatedCompletable);
        }
      );
    }
  }

  private static notifyCompletablePropertyListeners(
    type: CompletableType,
    completableId: string,
    propertyName: string,
    updatedValue: unknown
  ): void {
    const completableListeners = this.getCompletableListeners(type);
    if (
      completableListeners[completableId] &&
      completableListeners[completableId].propertyListeners[propertyName]
    ) {
      Object.values(
        completableListeners[completableId].propertyListeners[propertyName]
      ).forEach(callback => {
        callback(updatedValue);
      });
    }
  }

  private static getCompletableListeners(type: CompletableType) {
    if (type === 'project') {
      return this.projectListeners;
    }
    return this.taskListeners;
  }

  /**
   * Generates a function that saves the completable to the server and logs to
   * the console what happened.
   */
  private static saveCompletable(
    type: CompletableType,
    completable: Completable
  ) {
    return () => {
      let patchCompletable;
      if (type === 'project') {
        patchCompletable = patchProject;
      } else {
        patchCompletable = patchTask;
      }
      patchCompletable(completable)
        .then(result => {
          if (result) {
            // eslint-disable-next-line
            console.log(
              `${type} with ID: ${completable._id} was ` +
                `successfully saved to the server`
            );
          } else {
            // eslint-disable-next-line
            console.log(
              `${type} with ID: ${completable._id} failed ` +
                `to save to the server`
            );
          }
        })
        .catch(err => {
          // eslint-disable-next-line
          console.error(err);
        });
    };
  }
  // #endregion

  // #region Public Methods
  /**
   * Sets the entire projects object to the provided value. This does not
   * trigger any callbacks.
   *
   * @param {ProjectObjects} projects the updated projects object
   */
  static setProjects(projects: ProjectObjects): void {
    this.projects = projects;
  }

  /**
   * Sets the completable to the updated value, triggers any listeners attached
   * to it, and schedules it to be saved on the server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {Completable} completable the updated completable
   */
  static setAndSaveCompletable(
    type: 'project' | 'task',
    completable: Completable
  ) {
    if (type === 'project') {
      this.projects[completable._id] = completable;
    } else {
      this.tasks[completable._id] = completable;
    }
    this.notifyCompletableListeners(type, completable._id, completable);
    scheduleCallback(
      `${completable._id}.saveCompletable`,
      this.saveCompletable(type, completable)
    );
  }

  /**
   * Sets the given completable property, notifies listeners of that property,
   * and saves the updated completable on the server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {string} propertyName the name of the property as it appears as a
   * key on the completable
   * @param {unknown} value the updated property value
   */
  static setAndSaveCompletableProperty(
    type: CompletableType,
    completableId: string,
    propertyName: string,
    value: unknown
  ): void {
    let completables;
    if (type === 'project') {
      completables = this.projects;
    } else {
      completables = this.tasks;
    }
    completables[completableId][propertyName] = value;
    this.notifyCompletablePropertyListeners(
      type,
      completableId,
      propertyName,
      value
    );

    // Save the updated completable on the server
    scheduleCallback(
      `${completableId}.saveCompletable`,
      this.saveCompletable(type, completables[completableId])
    );
  }

  static getProjects(): ProjectObjects {
    return this.projects;
  }

  static getCompletable(type: CompletableType, completableId: string) {
    if (type === 'project') {
      return this.projects[completableId];
    }
    return this.tasks[completableId];
  }

  /**
   * Deletes the completable with the given ID from its completables object,
   * sends null to its listeners, then removes all the listeners.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable to delete
   */
  static deleteCompletable(type: CompletableType, completableId: string) {
    let completables;
    let completableListeners;
    if (type === 'project') {
      completables = this.projects;
      completableListeners = this.projectListeners;
    } else {
      completables = this.tasks;
      completableListeners = this.taskListeners;
    }
    delete completables[completableId];
    this.notifyCompletableListeners(type, completableId, null);
    delete completableListeners[completableId];
  }

  /**
   * Sets the given project and notifies all listeners assigned to it with
   * the updated project.
   *
   * @param {Project} project the updated Project
   */
  static setProject(project: Project): void {
    this.setAndSaveCompletable('project', project);
  }

  static setTasks(tasks: TaskObjects): void {
    this.tasks = tasks;
  }

  static getTasks(): TaskObjects {
    return this.tasks;
  }

  static setTask(task: Task): void {
    this.setAndSaveCompletable('task', task);
  }

  /**
   * Adds a listener to a particular completable so that when any changes are
   * made to the completable, the provided callback is ran with the updated
   * completable provided to it.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {string} listenerId the unique ID of the listener. This should be
   * something like `<listeningTaskOrProjectID>.<ComponentName>`. For example:
   * `H2532hlh2l3h5l2520.CompletableRow`.
   * @param {ListenerCallback} callback the callback to run when changes are
   * made to the completable with the provided ID
   */
  static addCompletableListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    callback: ListenerCallback
  ) {
    const completableListeners = this.getCompletableListeners(type);
    if (!completableListeners[completableId]) {
      completableListeners[completableId] = {
        listeners: {},
        propertyListeners: {},
      };
    }
    completableListeners[completableId].listeners[listenerId] = callback;
  }

  static addCompletablePropertyListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    propertyName: string,
    callback: PropertyListenerCallback
  ) {
    const completableListeners = this.getCompletableListeners(type);
    if (!completableListeners[completableId]) {
      completableListeners[completableId] = {
        listeners: {},
        propertyListeners: {},
      };
    }
    if (!completableListeners[completableId].propertyListeners[propertyName]) {
      completableListeners[completableId].propertyListeners[propertyName] = {};
    }
    completableListeners[completableId].propertyListeners[propertyName][
      listenerId
    ] = callback;
  }

  static removeCompletableListener(
    type: CompletableType,
    completableId: string,
    listenerId: string
  ) {
    const completableListeners = this.getCompletableListeners(type);
    if (
      completableListeners[completableId] &&
      completableListeners[completableId].listeners[listenerId]
    ) {
      delete completableListeners[completableId].listeners[listenerId];
    }
  }

  static removeCompletablePropertyListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    propertyName: string
  ) {
    const completableListeners = this.getCompletableListeners(type);
    if (
      completableListeners[completableId] &&
      completableListeners[completableId].propertyListeners[propertyName]
    ) {
      delete completableListeners[completableId].propertyListeners[
        propertyName
      ][listenerId];
    }
  }
  // #endregion
}

export default ClientData;
