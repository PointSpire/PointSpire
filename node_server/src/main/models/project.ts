import mongoose, { Model, Schema } from 'mongoose';
import { TaskDoc } from './task';

const ObjectId = mongoose.Types.ObjectId;

/**
 * The mongoose schema for a Project in the database.
 */
const projectSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  note: String,
  date: { type: Date, default: Date.now },
  subtasks: [{ type: ObjectId, ref: 'Task' }],
});

/**
 * The type representing a Project document in the database. This extends the
 * `TaskDoc` type.
 */
export interface ProjectDoc extends TaskDoc {
  subtasks: Array<typeof ObjectId> | Array<TaskDoc>;
}

/**
 * Tests if an array is a ProjectDoc array or an ObjectId array. This is used
 * for the situation where `populate` is used in a mongoose query, likely for
 * the `User` class.
 *
 * @param {Array<typeof ObjectId> | Array<ProjectDoc>} array the array to test
 * if it is an ObjectId array or ProjectDoc array.
 * @returns {boolean} true if the array is a ProjectDoc array
 */
export function isProjectDocArr(
  array: Array<typeof ObjectId> | Array<ProjectDoc>
): array is Array<ProjectDoc> {
  if (array.length === 0) {
    return false;
  } else {
    return (array as ProjectDoc[])[0].title !== undefined;
  }
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
