import mongoose, { Model, Schema, SchemaDefinition } from 'mongoose';
import { TaskDoc, taskSchema } from './task';

/**
 * Creates the projectSchema with the provided interfaces if desired.
 *
 * @param {...SchemaDefinition[]} addSchemas different additional schemas that
 * should be added to the project schema. This is like adding interfaces.
 * The things added here are just objects.
 * @returns {Schema} the created projectSchema
 */
function createProjectSchema(...addSchemas: SchemaDefinition[]): Schema {
  const schema = new Schema();
  if (addSchemas) {
    addSchemas.forEach(addSchema => {
      schema.add(addSchema);
    });
  }
  return schema;
}

const projectSchema = createProjectSchema(taskSchema);

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
