/**
 * This file is meant to hold the different types associated with the database
 * for PointSpire.
 */

import { AllUserData } from '../models/User';

/**
 * The basic type for a document from MongoDB.
 */
export interface Document extends IndexableProperties {
  _id: string;
  __v?: number;
}

export function isDocument(obj: object): obj is Document {
  const objToTest = obj as Document;
  if (objToTest._id && typeof objToTest === 'string') {
    return true;
  }
  return false;
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

/**
 * The type of object returned from an import request.
 */
export type ImportReturnObject = {
  valid: boolean;
  err?: object;
  userData?: AllUserData;
};
