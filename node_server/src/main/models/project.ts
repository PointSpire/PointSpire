import mongoose, { Model, Schema } from 'mongoose';
import { TaskDoc } from './task';

/**
 * The mongoose schema for a Project in the database.
 */
const projectSchema = new Schema({
  title: String,
  note: String,
  date: { type: Date, default: Date.now },
  author: mongoose.Schema.Types.ObjectId,
});

/**
 * The type representing a Project document in the database. This extends the
 * `TaskDoc` type.
 */
export type ProjectDoc = TaskDoc;

/**
 * A `Project` class that represents a project in the MongoDB. This extends
 * the mongoose `Model` type. This is essentially a top-level `Task`.
 *
 * This can be used for example with:
 * ```
 * let newProject = new Project({title: 'A new project'});
 * ```
 */
export type ProjectModel = Model<ProjectDoc>;

/**
 * Creates a `Project` model from a given connected mongoose MongoDB database.
 *
 * @param {mongoose} db the connected mongoose MongoDB connection
 * @returns {ProjectModel} the `Project` class
 */
export function createProjectModel(db: typeof mongoose): ProjectModel {
  return db.model('Project', projectSchema);
}
