import mongoose, { Model, Schema } from 'mongoose';
import { TaskDoc } from './task';

const ObjectId = mongoose.Types.ObjectId;

/**
 * The mongoose schema for a Project in the database.
 */
const projectSchema = new Schema({
  title: String,
  note: String,
  date: { type: Date, default: Date.now },
  subtasks: [ObjectId],
});

/**
 * The type representing a Project document in the database. This extends the
 * `TaskDoc` type.
 */
export interface ProjectDoc extends TaskDoc {
  subtasks: Array<typeof ObjectId>;
}

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
