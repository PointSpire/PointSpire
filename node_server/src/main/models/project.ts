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
  startDate: {
    type: Date,
    default: null,
  },
  dueDate: {
    type: Date,
    default: null,
  },
  priority: require('mongoose-int32'),
  dateCreated: { type: Date, default: Date.now },
  subtasks: [{ type: ObjectId, ref: 'Task', default: [] }],
});

/**
 * Used to hold a map of project IDs paired with their ProjectDoc. This
 * is used when building an AllUserData object.
 */
export type ProjectObjects = {
  [id: string]: ProjectDoc;
};

/**
 * The type representing a Project document in the database. This extends the
 * `TaskDoc` type.
 */
export interface ProjectDoc extends TaskDoc {
  /**
   * To be used when doing a graphLookup on a ProjectDoc.
   */
  subtask_hierarchy?: Array<TaskDoc>;
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
