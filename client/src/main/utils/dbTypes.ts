/**
 * This file is meant to hold the different types associated with the database
 * for PointSpire.
 */

/**
 * The basic type for a document from MongoDB.
 */
export interface Document extends IndexableProperties {
  _id: string;
  __v?: number;
}

/**
 * Can be used to make it so that an object is indexable.
 */
export interface IndexableProperties {
  [key: string]: unknown;
}

export type PropertyListeners = {
  [propertyName: string]: {
    [listenerId: string]: PropertyListenerCallback;
  };
};

export type PropertyListenerCallback = (updatedValue: unknown) => void;
