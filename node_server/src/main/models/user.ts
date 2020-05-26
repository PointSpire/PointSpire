import mongoose, { Model, Schema, Document } from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

/**
 * The mongoose schema for a User in the database. There can be duplicate
 * usernames in the DB, because uniqueness is determined by the `_id` value.
 */
const userSchema = new Schema({
  userName: {
    type: String,
    required: true,
  },
  firstName: String,
  lastName: String,
  githubId: String,
  dateCreated: { type: Date, default: Date.now },
  projects: [ObjectId],
});

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
