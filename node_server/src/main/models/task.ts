import mongoose, { Model, Schema, Document } from 'mongoose';

const ObjectId = mongoose.Types.ObjectId;

/**
 * The mongoose schema for a Task in the database.
 */
const taskSchema = new Schema({
  title: String,
  note: String,
  date: { type: Date, default: Date.now },
  subtasks: [
    {
      type: ObjectId,
      ref: 'Task',
      default: new Array<typeof ObjectId>(),
    },
  ],
});

/**
 * The type representing a Task document in the database. This extends the
 * mongoose `Document` type.
 */
export interface TaskDoc extends Document {
  title: string;
  note: string;
  date: Date;
  subtasks: Array<typeof ObjectId> | Array<TaskDoc>;
}

/**
 * Tests if an array is a TaskDoc array or an ObjectId array. This is used
 * for the situation where `populate` is used in a mongoose query, likely for
 * the `Project` class.
 *
 * @param {Array<typeof ObjectId> | Array<TaskDoc>} array the array to test
 * if it is an ObjectId array or TaskDoc array.
 * @returns {boolean} true if the array is a TaskDoc array and false if it is
 * not or the array is empty
 */
export function isTaskDocArr(
  array: Array<typeof ObjectId> | Array<TaskDoc>
): array is Array<TaskDoc> {
  if (array.length === 0) {
    return false;
  } else {
    return (array as TaskDoc[])[0].title !== undefined;
  }
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
