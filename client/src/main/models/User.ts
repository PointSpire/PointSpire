import Debug from 'debug';
import {
  IndexableProperties,
  Document,
  PropertyListenerCallback,
} from '../utils/dbTypes';
import { PropertyListeners } from '../clientData/UserData';
import { patchUser, deleteTag } from '../utils/fetchMethods';
import scheduleCallback from '../utils/savingTimer';
import Completables from './Completables';

const debug = Debug('User.ts');
debug.enabled = true;

export type UserSettings = {
  yellowGreenTasks: boolean;
  notesExpanded: boolean;

  /**
   * This is defined so that extra settings can be added onto the settings
   * object.
   */
  [settingName: string]: boolean;
};

export interface UserTag {
  color: string;
  name: string;
}

/**
 * The filters that the user has set.
 */
export interface UserFilters extends IndexableProperties {
  showFutureStartDates: boolean;
  showCompletedTasks: boolean;
  tagIdsToShow: Array<string>;
}

export interface UserTags {
  [tagId: string]: UserTag;
}

export interface UserDoc extends Document {
  projects: Array<string>;
  firstName: string;
  lastName: string;
  githubId: string;
  dateCreated: Date;
  userName: string;
  settings: UserSettings;
  currentTags: UserTags;
  filters: UserFilters;
}

export type UserListenerCallback = (user: UserDoc | null) => void;

export type UserListeners = {
  listeners: {
    [listenerId: string]: UserListenerCallback;
  };
  propertyListeners: PropertyListeners;
};

/**
 * Represents the User data structure on the client along with static methods
 * for updating and adding listeners to it.
 */
export default abstract class User {
  private static user: UserDoc;

  private static userListeners: UserListeners = {
    listeners: {},
    propertyListeners: {},
  };

  /**
   * Notifies all of the listeners for the user object itself that the entire
   * user object has changed. This does not trigger the individual property
   * listeners. (Although it may need to in the future perhaps).
   *
   * @param {UserDoc} updatedUser the updated user object
   */
  private static notifyListeners(updatedUser: UserDoc | null) {
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
  private static notifyPropertyListeners(
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

  /**
   * Generates a function that saves the user to the server and logs what
   * happened to the console.
   *
   * @param {UserDoc} updatedUser the updated user object
   */
  private static save(updatedUser: UserDoc) {
    return async () => {
      return patchUser(updatedUser)
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
   * Sets the property on the user and triggers callbacks but doesn't save
   * to the server.
   *
   * @param {string} property the property to update
   * @param {unknown} value the new value of the property
   */
  static setProperty(property: string, value: unknown) {
    this.user[property] = value;
    this.notifyPropertyListeners(property, value);
  }

  /**
   * Sets the user object to the provided value triggers callbacks but doesn't
   * save to the server.
   *
   * @param {UserDoc} user the fresh user object from the server
   */
  static set(user: UserDoc): void {
    this.user = user;

    // Set the setting if it doesn't exist yet
    if (!this.user.settings.notesExpanded) {
      this.user.settings.notesExpanded = false;
    }

    this.notifyListeners(user);
  }

  /**
   * Returns a copy of the user object.
   */
  static get(): UserDoc {
    return { ...this.user };
  }

  /**
   * Sets the given property on the user object, triggers callbacks for that
   * property, and schedules the user to be saved on the server.
   *
   * @param {string} propertyName the name of the property to set on the user
   * object
   * @param {unknown} value the updated value of the property
   */
  static setAndSaveProperty(propertyName: string, value: unknown) {
    this.setProperty(propertyName, value);
    scheduleCallback(`user.saveUser`, this.save(this.user));
  }

  /**
   * Removes the tag with the given ID from the user, and any projects or tasks
   * of the user. This saves those changes the server and triggers listeners
   * for all associated properties of the projects, tasks, and the user.
   *
   * @param {string} tagId the ID of the tag to remove
   */
  static removeTagAndSave(tagId: string): void {
    if (this.user.currentTags[tagId]) {
      delete this.user.currentTags[tagId];
    }

    // Change the user property for currentTags
    this.setProperty('currentTags', { ...this.user.currentTags });

    // Remove the tag from the user's filters if it is there
    const filterTagIndex = this.user.filters.tagIdsToShow.indexOf(tagId);
    if (filterTagIndex !== -1) {
      this.user.filters.tagIdsToShow.splice(filterTagIndex, 1);
      this.setProperty('filters', { ...this.user.filters });
    }

    Completables.removeTag(tagId);

    // Schedule the deletion request for the server
    scheduleCallback(`${this.user._id}.deleteTag.${tagId}`, async () => {
      await deleteTag(this.user._id, tagId);
    });
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
  static addListener(listenerId: string, callback: UserListenerCallback) {
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
  static addPropertyListener(
    listenerId: string,
    propertyName: string,
    callback: PropertyListenerCallback
  ) {
    if (!this.userListeners.propertyListeners[propertyName]) {
      this.userListeners.propertyListeners[propertyName] = {};
    }
    this.userListeners.propertyListeners[propertyName][listenerId] = callback;
  }

  static removeListener(listenerId: string) {
    if (this.userListeners.listeners[listenerId]) {
      delete this.userListeners.listeners[listenerId];
    }
  }

  static removePropertyListener(propertyName: string, listenerId: string) {
    if (
      this.userListeners.propertyListeners[propertyName] &&
      this.userListeners.propertyListeners[propertyName][listenerId]
    ) {
      delete this.userListeners.propertyListeners[propertyName][listenerId];
    }
  }
}
