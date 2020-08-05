import Debug from 'debug';
import { PropertyListeners } from '../clientData/UserData';
import Completable from './Completable';
import scheduleCallback from '../utils/savingTimer';
import {
  patchProject,
  patchTask,
  deleteProject,
  deleteTaskById,
  postNewTask,
  postNewProject,
} from '../utils/fetchMethods';
import Project from './Project';
import Task from './Task';
import { PropertyListenerCallback } from '../utils/dbTypes';
import User from './User';

const debug = Debug('Completables.ts');
debug.enabled = true;

export type CompletableType = 'project' | 'task';

export type CompletableListenerCallback = (
  completable: Completable | null
) => void;

export type CompletableListeners = {
  [completableId: string]: {
    listeners: {
      [listenerId: string]: CompletableListenerCallback;
    };
    propertyListeners: PropertyListeners;
  };
};

export type ProjectObjects = {
  [id: string]: Project;
};

export type TaskObjects = {
  [id: string]: Task;
};

/**
 * Represents the collection of completables held on the client. This class
 * allows operations that can be done on both Projects and Tasks.
 */
export default abstract class Completables {
  private static projects: ProjectObjects;

  private static tasks: TaskObjects;

  private static projectListeners: CompletableListeners = {};

  private static taskListeners: CompletableListeners = {};

  private static getListeners(type: CompletableType) {
    if (type === 'project') {
      return this.projectListeners;
    }
    return this.taskListeners;
  }

  /**
   * Notifies and runs all the callbacks for the associated completable.
   *
   * @param {CompletableType} type the type of the completable
   * @param {string} completableId the ID of the completable
   * @param {Completable | null} updatedCompletable the updated completable or
   * null if the completable was deleted
   */
  private static notifyListeners(
    type: CompletableType,
    completableId: string,
    updatedCompletable: Completable | null
  ) {
    const completableListeners = this.getListeners(type);
    if (completableListeners[completableId]) {
      Object.values(completableListeners[completableId].listeners).forEach(
        callback => {
          callback(updatedCompletable);
        }
      );
    }
  }

  private static notifyPropertyListeners(
    type: CompletableType,
    completableId: string,
    propertyName: string,
    updatedValue: unknown
  ): void {
    const completableListeners = this.getListeners(type);
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

  /**
   * Generates a function that saves the completable to the server and logs to
   * the console what happened.
   */
  private static save(type: CompletableType, completable: Completable) {
    return () => {
      let patchCompletable;
      if (type === 'project') {
        patchCompletable = patchProject;
      } else {
        patchCompletable = patchTask;
      }
      return patchCompletable(completable)
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
   * Sets the completable and triggers callbacks, but does not save to the
   * server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {Completable} completable the updated or new completable
   */
  private static set(type: CompletableType, completable: Completable) {
    if (type === 'project') {
      this.projects[completable._id] = completable;
    } else {
      this.tasks[completable._id] = completable;
    }
    this.notifyListeners(type, completable._id, completable);
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
  static setProperty(
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
    this.notifyPropertyListeners(type, completableId, property, value);
  }

  /**
   * Sets the entire projects object to the provided value.
   *
   * This doesn't trigger any callbacks because there shouldn't be any on the
   * entire projects object to help performance.
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
   * Sets the completable to the updated value, triggers any listeners attached
   * to it, and schedules it to be saved on the server.
   *
   * @param {CompletableType} type the type of the completable
   * @param {Completable} completable the updated completable
   */
  static setAndSave(type: 'project' | 'task', completable: Completable) {
    this.set(type, completable);
    scheduleCallback(
      `${completable._id}.saveCompletable`,
      this.save(type, completable)
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
  static setAndSaveProperty(
    type: CompletableType,
    completableId: string,
    propertyName: string,
    value: unknown
  ): void {
    this.setProperty(type, completableId, propertyName, value);
    let completables;
    if (type === 'project') {
      completables = this.projects;
    } else {
      completables = this.tasks;
    }

    // Save the updated completable on the server
    scheduleCallback(
      `${completableId}.saveCompletable`,
      this.save(type, completables[completableId])
    );
  }

  static get(type: CompletableType, completableId: string) {
    if (type === 'project') {
      return this.projects[completableId];
    }
    return this.tasks[completableId];
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
  static delete(type: CompletableType, completableId: string) {
    let completables;
    let completableListeners;
    let deleteCompletableOnServer: (id: string) => Promise<Task | null>;
    if (type === 'project') {
      completables = this.projects;
      completableListeners = this.projectListeners;
      deleteCompletableOnServer = deleteProject;

      const user = User.get();

      // Remove the project from the user's projects array locally
      user.projects.splice(user.projects.indexOf(completableId), 1);
      User.setProperty('projects', user.projects);
    } else {
      completables = this.tasks;
      completableListeners = this.taskListeners;
      deleteCompletableOnServer = deleteTaskById;
    }

    // Schedule the server deletion of the completable
    scheduleCallback(`${completableId}.delete`, async () => {
      await deleteCompletableOnServer(completableId);
    });

    delete completables[completableId];
    this.notifyListeners(type, completableId, null);
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
  static addListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    callback: CompletableListenerCallback
  ) {
    const completableListeners = this.getListeners(type);
    if (!completableListeners[completableId]) {
      completableListeners[completableId] = {
        listeners: {},
        propertyListeners: {},
      };
    }
    completableListeners[completableId].listeners[listenerId] = callback;
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
  static addPropertyListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    propertyName: string,
    callback: PropertyListenerCallback
  ) {
    const completableListeners = this.getListeners(type);
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

  static removeListener(
    type: CompletableType,
    completableId: string,
    listenerId: string
  ) {
    const completableListeners = this.getListeners(type);
    if (
      completableListeners[completableId] &&
      completableListeners[completableId].listeners[listenerId]
    ) {
      delete completableListeners[completableId].listeners[listenerId];
    }
  }

  static removePropertyListener(
    type: CompletableType,
    completableId: string,
    listenerId: string,
    propertyName: string
  ) {
    const completableListeners = this.getListeners(type);
    if (
      completableListeners[completableId] &&
      completableListeners[completableId].propertyListeners[propertyName]
    ) {
      delete completableListeners[completableId].propertyListeners[
        propertyName
      ][listenerId];
    }
  }

  /**
   * Removes the given tagId from all projects and tasks. This does not remove
   * it from the user.
   *
   * @param {string} tagId the ID of the tag to remove
   */
  static removeTag(tagId: string) {
    // Find all the projects with the tag and change them
    Object.values(this.projects).forEach(project => {
      if (project.tags) {
        const tagIndex = project.tags.findIndex(id => id === tagId);
        if (tagIndex !== -1) {
          project.tags.splice(tagIndex, 1);
          this.setProperty('project', project._id, 'tags', project.tags);
        }
      } else {
        debug(
          `The project with ID: "${project._id}" and title: "${project.title}"` +
            ` did not have a "tags" property.`
        );
      }
    });

    // Find all tasks with the tag and change them
    Object.values(this.tasks).forEach(task => {
      const tagIndex = task.tags.findIndex(id => id === tagId);
      if (tagIndex !== -1) {
        task.tags.splice(tagIndex, 1);
        this.setProperty('task', task._id, 'tags', task.tags);
      }
    });
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
    scheduleCallback(`${newTask._id}.addTaskToServer`, async () => {
      await postNewTask(parentType, parentId, newTask);
    });

    // Set the new task locally, and don't save to the server
    this.set('task', newTask);

    // Save the new task to the parent locally, and don't save to the server
    const parent = this.get(parentType, parentId);
    parent.subtasks.push(newTask._id);
    this.setProperty(parentType, parentId, 'subtasks', parent.subtasks);

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
    const user = User.get();
    scheduleCallback(`${newProject._id}.addTaskToServer`, async () => {
      await postNewProject(user._id, newProject);
    });

    // Set the new project locally, and don't save to the server
    this.set('project', newProject);

    // Save the new project to the user locally and don't save to the server
    const newProjectIds = [...user.projects];
    newProjectIds.push(newProject._id);
    User.setProperty('projects', newProjectIds);

    return newProject;
  }
}
