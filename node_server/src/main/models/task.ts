import mongoose, { Model, Schema, Document } from 'mongoose';
// const ObjectId = Schema.Types.ObjectId;

/**
 * The mongoose schema for a Task in the database.
 */
const taskSchema = new Schema({
  title: String,
  note: String,
  date: { type: Date, default: Date.now },
});

/**
 * The type representing a Task document in the database. This extends the
 * mongoose `Document` type.
 */
export interface TaskDoc extends Document {
  title: string;
  note: string;
  date: Date;
}

/**
 * A `Task` class that represents a task in the MongoDB. This extends
 * the mongoose `Model` type.
 *
 * This can be used for example with:
 * ```
 * let newTask = new Task({title: 'A new task'});
 * ```
 */
export type TaskModel = Model<TaskDoc>;

/**
 * Creates a `Task` model from a given connected mongoose MongoDB database.
 *
 * @param {mongoose} db the connected mongoose MongoDB connection
 * @returns {TaskModel} the `Task` class
 */
export function createTaskModel(db: typeof mongoose): TaskModel {
  return db.model('Task', taskSchema);
}
