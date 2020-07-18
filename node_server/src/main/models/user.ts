import mongoose, { Model, Schema, Document } from 'mongoose';
import { ProjectObjects } from './project';
import { TaskObjects } from './task';

const ObjectId = mongoose.Types.ObjectId;

/**
 * The mongoose schema for a User in the database. There can be duplicate
 * usernames in the DB, because uniqueness is determined by the `_id` value.
 *
 * Changes to this schema also need to be reflected in the UserDoc type and
 * the `swagger.ts` file under the asssociated part of the user object.
 */
const userSchema = new Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    firstName: String,
    lastName: String,
    githubId: String,
    dateCreated: { type: Date, default: Date.now },
    projects: [
      {
        type: ObjectId,
        ref: 'Project',
      },
    ],
    settings: {
      yellowGreenTasks: {
        type: Boolean,
        default: false,
      },
      notesExpanded: {
        type: Boolean,
        default: false,
      },
    },
    currentTags: {
      type: Object,
      default: {},
    },
    filters: {
      showFutureStartDates: {
        type: Boolean,
        default: false,
      },
      showCompletedTasks: {
        type: Boolean,
        default: false,
      },
      tagsIdsToShow: {
        type: [String],
        default: [],
      },
    },
  },
  // Setting minimize to false makes it so empty objects will save
  { minimize: false }
);

export type AllUserData = {
  user: UserDoc;
  projects: ProjectObjects;
  tasks: TaskObjects;
};

/**
 * The type representing a User document in the database.
 */
export interface UserDoc extends Document {
  userName: string;
  firstName: string;
  lastName: string;
  githubId: string;
  dateCreated: Date;
  projects: Array<typeof ObjectId>;
  settings: {
    yellowGreenTasks: boolean;
    notesExpanded: boolean;
  };
  currentTags: {
    [tagId: string]: {
      color: string;
      name: string;
    };
  };
  filters: {
    showFutureStartDates: boolean;
    showCompletedTasks: boolean;
    tagIdsToShow: Array<string>;
  };
}

/**
 * A `User` class that represents a user in the MongoDB. This extends
 * the mongoose `Model` type.
 *
 * This can be used for example with:
 * ```
 * let newUser = new User({userName: 'daxxn'});
 * ```
 */
export type UserModel = Model<UserDoc>;

/**
 * Creates a `User` model from a given connected mongoose MongoDB database.
 *
 * @param {mongoose} db the connected mongoose MongoDB connection
 * @returns {UserModel} the `User` class
 */
export function createUserModel(db: typeof mongoose): UserModel {
  return db.model('User', userSchema);
}
