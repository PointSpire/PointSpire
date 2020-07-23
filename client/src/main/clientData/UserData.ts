import {
  ProjectObjects,
  TaskObjects,
  Completable,
  CompletableType,
  User,
} from '../utils/dbTypes';
import scheduleCallback from '../utils/savingTimer';
import {
  patchProject,
  patchTask,
  patchUser,
  deleteProject,
  deleteTaskById,
  postNewProject,
  postNewTask,
  deleteTag,
} from '../utils/fetchMethods';
import Project from '../models/Project';
import Task from '../models/Task';

/**
 * The callback which will be called if any changes are made to a Completable.
 * If the completable is deleted, then null is passed to the callback.
 */
export type CompletableListenerCallback = (
  completable: Completable | null
) => void;

export type UserListenerCallback = (user: User | null) => void;

export type PropertyListenerCallback = (updatedValue: unknown) => void;

type PropertyListeners = {
  [propertyName: string]: {
    [listenerId: string]: PropertyListenerCallback;
  };
};

type CompletableListeners = {
  [completableId: string]: {
    listeners: {
      [listenerId: string]: CompletableListenerCallback;
    };
    propertyListeners: PropertyListeners;
  };
};

type UserListeners = {
  listeners: {
    [listenerId: string]: UserListenerCallback;
  };
  propertyListeners: PropertyListeners;
};

/**
 * Holds the data and operations on the data that needs to be held in RAM for
 * the user but should not be held in state. It also provides methods of
 * adding listeners to this data.
 */
class UserData {
  // #region Private Variables
  private static projects: ProjectObjects;

  private static tasks: TaskObjects;

  private static user: User;

  private static projectListeners: CompletableListeners = {};

  private static taskListeners: CompletableListeners = {};

  private static userListeners: UserListeners = {
    listeners: {},
    propertyListeners: {},
  };
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

  /**
   * Notifies all of the listeners for the user object itself that the entire
   * user object has changed. This does not trigger the individual property
   * listeners. (Although it may need to in the future perhaps).
   *
   * @param {User} updatedUser the updated user object
   */
  private static notifyUserListeners(updatedUser: User | null) {
    Object.values(this.userListeners.listeners).forEach(callback => {
      callback(updatedUser);
    });
  }

  /**
   * Notifies all of the listers attached to the specified property of the
   * user object that a change has occurred.
   *
   * @param {string} propertyName the name of the property to trigger listeners
   * for
   * @param {unknown} updatedValue the updated value
   */
  private static notifyUserPropertyListeners(
    propertyName: string,
    updatedValue: unknown
  ) {
    if (this.userListeners.propertyListeners[propertyName]) {
      Object.values(this.userListeners.propertyListeners[propertyName]).forEach(
        callback => {
          callback(updatedValue);
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

  /**
   * Generates a function that saves the user to the server and logs what
   * happened to the console.
   *
   * @param {User} updatedUser the updated user object
   */
  private static saveUser(updatedUser: User) {
    return () => {
      patchUser(updatedUser)
        .then(result => {
          if (result) {
            // eslint-disable-next-line
          console.log(`User with ID: ${updatedUser._id} was successfully ` +
                `saved to the server`
            );
          } else {
            // eslint-disable-next-line
          console.log(`User with ID: ${updatedUser._id} failed to save to ` +
                `the server`
            );
          }
        })
        .catch(err => {
          // eslint-disable-next-line
          console.error(err);
        });
    };
  }

  /**
   * Sets the completable and triggers callbacks, but does not save to the
   * server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {Completable} completable the updated or new completable
   */
  private static setCompletable(
    type: CompletableType,
    completable: Completable
  ) {
    if (type === 'project') {
      this.projects[completable._id] = completable;
    } else {
      this.tasks[completable._id] = completable;
    }
    this.notifyCompletableListeners(type, completable._id, completable);
  }

  /**
   * Sets the property on the completable with the given ID and triggers
   * callbacks for that property. This does not save to the server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {string} property the property to update
   * @param {unknown} value the updated value
   */
  private static setCompletableProperty(
    type: CompletableType,
    completableId: string,
    property: string,
    value: unknown
  ) {
    let completables;
    if (type === 'project') {
      completables = this.projects;
    } else {
      completables = this.tasks;
    }
    completables[completableId][property] = value;
    this.notifyCompletablePropertyListeners(
      type,
      completableId,
      property,
      value
    );
  }

  /**
   * Sets the property on the user and triggers callbacks but doesn't save
   * to the server.
   *
   * @param {string} property the property to update
   * @param {unknown} value the new value of the property
   */
  private static setUserProperty(property: string, value: unknown) {
    this.user[property] = value;
    this.notifyUserPropertyListeners(property, value);
  }
  // #endregion

  // #region Public Methods
  /**
   * Sets the entire projects object to the provided value.
   *
   * This doesn't trigger any callbacks because there shouldn't be any on the
   * entire projects object to help performance.
   *
   * This should be used at application startup, and when adding new projects.
   *
   * @param {ProjectObjects} projects the updated projects object
   */
  static setProjects(projects: ProjectObjects): void {
    this.projects = projects;
  }

  /**
   * Returns a copy of the projects object.
   */
  static getProjects(): ProjectObjects {
    return { ...this.projects };
  }

  /**
   * Sets the entire tasks object to the provided value.
   *
   * This doesn't trigger any callbacks because there shouldn't be any on the
   * entire tasks object to help performance.
   *
   * This should be used at application startup and when adding new tasks.
   *
   * @param {TaskObjects} tasks the new tasks object
   */
  static setTasks(tasks: TaskObjects): void {
    this.tasks = tasks;
  }

  /**
   * Returns a copy of the Tasks object.
   */
  static getTasks(): TaskObjects {
    return { ...this.tasks };
  }

  /**
   * Sets the user object to the provided value triggers callbacks but doesn't
   * save to the server.
   *
   * @param {User} user the fresh user object from the server
   */
  static setUser(user: User): void {
    this.user = user;

    // Set the setting if it doesn't exist yet
    if (!this.user.settings.notesExpanded) {
      this.user.settings.notesExpanded = false;
    }

    this.notifyUserListeners(user);
  }

  /**
   * Returns a copy of the user object in ClientData.
   */
  static getUser(): User {
    return { ...this.user };
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
    this.setCompletable(type, completable);
    scheduleCallback(
      `${completable._id}.saveCompletable`,
      this.saveCompletable(type, completable)
    );
  }

  /**
   * Sets the given property on the user object, triggers callbacks for that
   * property, and schedules the user to be saved on the server.
   *
   * @param {string} propertyName the name of the property to set on the user
   * object
   * @param {unknown} value the updated value of the property
   */
  static setAndSaveUserProperty(propertyName: string, value: unknown) {
    this.setUserProperty(propertyName, value);
    scheduleCallback(`user.saveUser`, this.saveUser(this.user));
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
    this.setCompletableProperty(type, completableId, propertyName, value);
    let completables;
    if (type === 'project') {
      completables = this.projects;
    } else {
      completables = this.tasks;
    }

    // Save the updated completable on the server
    scheduleCallback(
      `${completableId}.saveCompletable`,
      this.saveCompletable(type, completables[completableId])
    );
  }

  static getCompletable(type: CompletableType, completableId: string) {
    if (type === 'project') {
      return this.projects[completableId];
    }
    return this.tasks[completableId];
  }

  /**
   * Adds a task to the server with the given title and to the locally held
   * parent's subtasks array, then triggers the property callbacks for the
   * parent's subtasks property.
   *
   * @param {CompletableType} parentType the type of the parent of the new task
   * @param {string} parentId the ID of the parent of the new task
   * @param {string} title the title of the new task
   */
  static addTask(
    parentType: CompletableType,
    parentId: string,
    title: string
  ): Task {
    const newTask = new Task();
    newTask.title = title;
    scheduleCallback(`${newTask._id}.addTaskToServer`, () => {
      postNewTask(parentType, parentId, newTask);
    });

    // Set the new task locally, and don't save to the server
    this.setCompletable('task', newTask);

    // Save the new task to the parent locally, and don't save to the server
    const parent = this.getCompletable(parentType, parentId);
    parent.subtasks.push(newTask._id);
    this.setCompletableProperty(
      parentType,
      parentId,
      'subtasks',
      parent.subtasks
    );

    return newTask;
  }

  /**
   * Adds a project to the server and to the locally held user object. The
   * property listeners for the 'projects' property on the user object are then
   * triggered.
   *
   * @param {string} title the title of the new project
   */
  static addProject(title: string): Project {
    // Get the new project from the server
    const newProject = new Project();
    newProject.title = title;
    scheduleCallback(`${newProject._id}.addTaskToServer`, () => {
      postNewProject(this.user._id, newProject);
    });

    // Set the new project locally, and don't save to the server
    this.setCompletable('project', newProject);

    // Save the new project to the user locally and don't save to the server
    const newProjectIds = [...this.user.projects];
    newProjectIds.push(newProject._id);
    this.setUserProperty('projects', newProjectIds);

    return newProject;
  }

  /**
   * Removes the tag with the given ID from the user, and any projects or tasks
   * of the user. This saves those changes the server and triggers listeners
   * for all associated properties of the projects, tasks, and the user.
   *
   * @param {string} tagId the ID of the tag to remove
   */
  static removeUserTagAndSave(tagId: string): void {
    if (this.user.currentTags[tagId]) {
      delete this.user.currentTags[tagId];
    }

    // Change the user property
    this.setUserProperty('currentTags', { ...this.user.currentTags });

    // Find all projects with the tag and change them
    Object.values(this.projects).forEach(project => {
      const tagIndex = project.tags.findIndex(id => id === tagId);
      if (tagIndex !== -1) {
        project.tags.splice(tagIndex, 1);
        this.setCompletableProperty(
          'project',
          project._id,
          'tags',
          project.tags
        );
      }
    });

    // Find all tasks with the tag and change them
    Object.values(this.tasks).forEach(task => {
      const tagIndex = task.tags.findIndex(id => id === tagId);
      if (tagIndex !== -1) {
        task.tags.splice(tagIndex, 1);
        this.setCompletableProperty('task', task._id, 'tags', task.tags);
      }
    });

    // Schedule the deletion request for the server
    scheduleCallback(`${this.user._id}.deleteTag.${tagId}`, () => {
      deleteTag(this.user._id, tagId);
    });
  }

  /**
   * Deletes the completable with the given ID from its completables object,
   * sends null to its listeners, removes all the listeners, then schedules the
   * deletion on the server.
   *
   * If this is a project, then it also deletes the project from the user,
   * triggers the associated listeners, and updates the user on the server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable to delete
   */
  static deleteCompletable(type: CompletableType, completableId: string) {
    let completables;
    let completableListeners;
    let deleteCompletableOnServer: (id: string) => void;
    if (type === 'project') {
      completables = this.projects;
      completableListeners = this.projectListeners;
      deleteCompletableOnServer = deleteProject;

      // Remove the project from the user's projects array
      this.user.projects.splice(this.user.projects.indexOf(completableId), 1);
      this.setAndSaveUserProperty('projects', this.user.projects);
    } else {
      completables = this.tasks;
      completableListeners = this.taskListeners;
      deleteCompletableOnServer = deleteTaskById;
    }

    // Schedule the server deletion of the completable
    scheduleCallback(`${completableId}.delete`, () => {
      deleteCompletableOnServer(completableId);
    });

    delete completables[completableId];
    this.notifyCompletableListeners(type, completableId, null);
    delete completableListeners[completableId];
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
   * @param {CompletableListenerCallback} callback the callback to run when changes are
   * made to the completable with the provided ID
   */
  static addCompletableListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    callback: CompletableListenerCallback
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

  /**
   * Adds a listener to the user object so that when the entire user object is
   * set, the provided callback is ran.
   *
   * @param {string} listenerId the unique ID of the listener. This should be
   * something like `<ComponentName>`. For example: `ProjectTable`.
   * @param {UserListenerCallback} callback the callback to run when the
   * user object is changed
   */
  static addUserListener(listenerId: string, callback: UserListenerCallback) {
    this.userListeners.listeners[listenerId] = callback;
  }

  /**
   * Adds a listener to the given property of the user object so that when
   * changes are made to that property, the callback is ran with the updated
   * value.
   *
   * @param {string} listenerId the unique ID of the listener. This should be
   * something like `<ComponentName>`. For example: `ProjectTable`.
   * @param {string} propertyName the property to assign the listener to
   * @param {PropertyListenerCallback} callback the callback to run when the
   * property is changed
   */
  static addUserPropertyListener(
    listenerId: string,
    propertyName: string,
    callback: PropertyListenerCallback
  ) {
    if (!this.userListeners.propertyListeners[propertyName]) {
      this.userListeners.propertyListeners[propertyName] = {};
    }
    this.userListeners.propertyListeners[propertyName][listenerId] = callback;
  }

  /**
   * Adds a listener to the given property of the completable object so that
   * when changes are made to that property, the callback is ran with the
   * updated value.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {string} listenerId the unique ID of the listener. This should be
   * something like `<listeningTaskOrProjectID>.<ComponentName>`. For example:
   * `H2532hlh2l3h5l2520.CompletableRow`.
   * @param {string} propertyName the property to assign the listener to
   * @param {PropertyListenerCallback} callback the callback to run when the
   * property is changed
   */
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

  static removeUserListener(listenerId: string) {
    if (this.userListeners.listeners[listenerId]) {
      delete this.userListeners.listeners[listenerId];
    }
  }

  static removeUserPropertyListener(propertyName: string, listenerId: string) {
    if (
      this.userListeners.propertyListeners[propertyName] &&
      this.userListeners.propertyListeners[propertyName][listenerId]
    ) {
      delete this.userListeners.propertyListeners[propertyName][listenerId];
    }
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

export default UserData;
