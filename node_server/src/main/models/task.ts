import mongoose, { Model, Schema, Document } from 'mongoose';
const ObjectId = Schema.Types.ObjectId;

/**
 * The mongoose schema for a Task in the database.
 */
const taskSchema = new Schema({
  title: String,
  note: String,
  date: { type: Date, default: Date.now },
  subTask: [{ type: ObjectId, ref: 'Task', default: [] }],
});

/**
 * The type representing a Task document in the database. This extends the
 * mongoose `Document` type.
 */
export interface TaskDoc extends Document {
  title: string;
  note: string;
  date: Date;
  subTask: Array<typeof ObjectId>;
}

/**
 * Test a task for the presence of a subtask array.
 *
 * @param {TaskDoc} task Task to examine.
 * @returns {boolean} true if array is occupied.
 */
export function isSubTasksEmpty(task: TaskDoc): boolean {
  if (!task.subTask) {
    return false;
  }

  if (task.subTask.length === 0) {
    return false;
  }

  return true;
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
  // REMOVE LATER
  console.log('in createTaskModel');
  return db.model('Task', taskSchema);
}
