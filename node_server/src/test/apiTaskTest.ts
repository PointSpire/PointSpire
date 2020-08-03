import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { TaskDoc } from '../main/models/task';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

/**
 * Generates a random number between 0 and the given max (non-inclusive).
 *
 * @param {number} max the maximum value, non-inclusive, to be selected in the random
 * integers
 * @returns {number} an integer from 0 to max (non-inclusive)
 */
function getRandomInt(max: number): number {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Generates random properties for use by the test suite.
 */
class TaskTester {
  /**
   * the values to use in the random selection.
   */
  private static selection = {
    titles: [
      'just do it',
      'get project done',
      'try to help tony',
      'fill my brain',
      'another one',
      'Add more! Its fun.',
    ],
    notes: [
      'why u no done',
      'how much longer',
      'idk what to do',
      'my head hurts',
      'its not done fast enough',
    ],
    emptyString: '',
  };

  public title: string;
  public note: string;

  /**
   * Creates a new TaskTester class.
   *
   * @param {string} title title property
   * @param {string} note note property
   */
  constructor(title: string, note: string) {
    this.title = title;
    this.note = note;
  }

  /**
   * Generates an new TaskTester class to use to run the tests.
   * Its not necessary but i thought it would be fun.
   *
   * @returns {TaskTester} Object to use for the test.
   */
  static selectTaskValues(): TaskTester {
    const title = this.selection.titles[
      getRandomInt(this.selection.titles.length)
    ];
    const note = this.selection.notes[
      getRandomInt(this.selection.notes.length)
    ];
    return new TaskTester(title, note);
  }
}

/**
 * Wrapper class for generateTestTask.
 */
class TaskContainer {
  public doc: TaskDoc;
  public values: TaskTester;

  /**
   * Creates a new TaskContainer
   *
   * @param {TaskDoc} doc TaskDoc task created
   * @param {TaskTester} values Task values used in TaskDoc
   */
  constructor(doc: TaskDoc, values: TaskTester) {
    this.doc = doc;
    this.values = values;
  }
}

/**
 * Generates a new testUser UserDoc by making a request to the server. It
 * also asserts that the returned item came back correctly.
 */
async function generateTestTask(): Promise<TaskContainer> {
  // Generates a new TaskTester class for the new TaskDoc.
  const selectedTask = TaskTester.selectTaskValues();

  // Posts the task to the DB.
  const res = await Globals.requester
    .post(`/api/projects/${Globals.testProject._id}/subtasks`)
    .send(selectedTask);

  // Makes sure the response is good and the new task is valid.
  assert.typeOf(res.body, 'object');
  assert.equal(res.body.title, selectedTask.title);
  assert.equal(res.body.note, selectedTask.note);

  // Converts the response to a TaskDoc and wraps it with the
  //  initial values.
  const testTask: TaskDoc = res.body;
  return new TaskContainer(testTask, selectedTask);
}

/**
 * Delets a task from the database by requesting it to be deleted by the
 * associated ID.
 *
 * @param {string} id the id of the task to delete
 */
async function removeTask(id: string): Promise<boolean> {
  await Globals.requester.delete(`/api/tasks/${id}`);
  return true;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    // Creates the GET request.
    Globals.requester.get('/api/tasks').end((err, res) => {
      // Checks the response for the expected error.
      assert.isNull(err);
      assert.equal(res.status, 405);
      assert.equal(
        res.text,
        'Please specify a task ID by using /api/tasks/2 where ' +
          '"2" is the ID of the task.'
      );
      done();
    });
  });
});

describe('GET /id', () => {
  it('Should get the task by id and return it, if the id is found.', async () => {
    // Creates a new TaskContainer with the TaskDoc.
    const container = await generateTestTask();
    const testTask = container.doc;

    // Check for the created TaskDoc.
    const taskResponse = await Globals.requester.get(
      `/api/tasks/${testTask._id}`
    );
    assert.equal(taskResponse.status, 200);
    assert.exists(taskResponse.body, 'res.body not defined.');

    // Matchs the response to the created TaskDoc.
    const foundTask: TaskDoc = taskResponse.body;
    assert.equal(foundTask._id, testTask._id);
    assert.equal(foundTask.title, testTask.title);
    assert.equal(foundTask.note, testTask.note);
    assert.equal(foundTask.dateCreated, testTask.dateCreated);
  });
  it('Should return 400 if the id is not found', done => {
    Globals.requester.get(`/api/tasks/42`).end((err, res) => {
      assert.isNull(err);
      assert.equal(res.status, 400);
      done();
    });
  });
});

describe('PATCH /id', () => {
  it('should modify a task by adding the content of the body', async () => {
    // Creates a new TaskContainer with the TaskDoc and task data.
    const container = await generateTestTask();
    const testTask = container.doc;
    const selectedTask = container.values;

    // Creates a PATCH request to the DB
    const res = await Globals.requester
      .patch(`/api/tasks/${testTask._id}`)
      .send(selectedTask);
    // Makes sure the response isnt an error and
    //  checks the response for data.
    assert.equal(res.status, 200);
    assert.typeOf(res.body, 'object');

    // Matches the response to the created TaskDoc.
    const returnedTask: TaskDoc = res.body;
    assert.equal(returnedTask.title, selectedTask.title);
    assert.equal(returnedTask.note, selectedTask.note);

    await removeTask(returnedTask._id);
  });
});

describe('DELETE /id', () => {
  it('should delete a task and any subtasks that are associated with it.', async () => {
    // Creates a new TaskContainer with the TaskDoc and task data.
    const container = await generateTestTask();
    const testTask = container.doc;

    // Creates a DELETE request to the DB.
    const deleteRes = await Globals.requester.delete(
      `/api/tasks/${testTask._id}`
    );
    assert.equal(deleteRes.status, 200);
    assert.typeOf(deleteRes.body, 'object');

    await removeTask(testTask._id);
  });
});

describe('POST /id/subtasks', () => {
  it('should create a new subtask if correct data is sent', async () => {
    try {
      const testContainer = await generateTestTask();
      const testTask = testContainer.doc;
      const res = await Globals.requester
        .post(`/api/tasks/${testTask._id}/subtasks`)
        .send({
          title: 'Some new task',
          note: 'Some task note',
        });
      assert.equal(res.status, 201);
      assert.typeOf(res.body, 'object');
      assert.equal(res.body.title, 'Some new task');
      assert.equal(res.body.note, 'Some task note');
      const newTask: TaskDoc = res.body;
      const taskRes = await Globals.requester.get(`/api/tasks/${testTask._id}`);
      const returnTask: TaskDoc = taskRes.body;
      assert.equal(returnTask.subtasks.includes(newTask._id), true);
    } catch (err) {
      assert.isNull(err);
    }
  });
});
