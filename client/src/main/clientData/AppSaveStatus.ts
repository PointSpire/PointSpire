/**
 * pendingChanges state enum
 */
export enum SavedStatus {
  Save = 'Save',
  Saving = 'Saving',
  Saved = 'Saved',
}

export type SaveListenerCallback = (updatedStatus: SavedStatus) => void;

type SaveListeners = {
  [listenerId: string]: SaveListenerCallback;
};

/**
 * Contains the operations to listen to and set the save status of the
 * application.
 */
export class AppSaveStatus {
  /**
   * Indicates the status of changes of the user.
   */
  private static savedStatus: SavedStatus = SavedStatus.Saved;

  /**
   * The listeners of the save status changes.
   */
  private static saveListeners: SaveListeners = {};

  /**
   * Notifies and runs all the callbacks for the save status listeners.
   *
   * @param {SavedStatus} updatedStatus the updated SavedStatus
   */
  private static notifySaveListeners(updatedStatus: SavedStatus) {
    Object.values(this.saveListeners).forEach(callback => {
      callback(updatedStatus);
    });
  }

  /**
   * Gets the current saved status of the application.
   *
   * @returns {SavedStatus} the current saved status
   */
  static getStatus(): SavedStatus {
    return this.savedStatus;
  }

  /**
   * Updates the applications saved state.
   *
   * @param {SavedStatus} updatedStatus the updated save status
   */
  static setStatus(updatedStatus: SavedStatus) {
    if (this.savedStatus !== updatedStatus) {
      this.savedStatus = updatedStatus;
      this.notifySaveListeners(updatedStatus);
    }
  }

  /**
   * Adds the given callback to the list of listeners for chagnes in the save
   * status of the application.
   *
   * @param {string} listenerId the unique ID of the listener. Should be
   * unique among different instances of components in the application.
   * @param {SaveListenerCallback} callback the callback to run when a change
   * in the save status occurs
   */
  static addSavedStatusListener(
    listenerId: string,
    callback: SaveListenerCallback
  ) {
    this.saveListeners[listenerId] = callback;
  }

  /**
   * Removess the listener with the given ID from the list of listeners for the
   * save status.
   *
   * @param {string} listenerId the listener ID
   */
  static removeSavedStatusListener(listenerId: string) {
    if (this.saveListeners[listenerId]) {
      delete this.saveListeners[listenerId];
    }
  }
}
