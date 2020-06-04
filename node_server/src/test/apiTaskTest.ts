import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { TaskDoc } from '../main/models/task';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

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
    // Generates 2 random numbers bound by the length of the arrays.
    const titleRoll: number = Math.round(
      Math.random() * this.selection.titles.length
    );
    const noteRoll: number = Math.round(
      Math.random() * this.selection.notes.length
    );

    // Sets the values to the base index in case the random
    //  numbers are outside the bounds of the array.
    let selTitle = this.selection.titles[0];
    let selNote = this.selection.notes[0];

    // Checks the random numbers for a usable index.
    if (titleRoll <= this.selection.titles.length && titleRoll >= 0) {
      selTitle = this.selection.titles[titleRoll];
    }

    // Same as first one.
    if (noteRoll <= this.selection.notes.length && noteRoll >= 0) {
      selNote = this.selection.notes[noteRoll];
    }

    return new TaskTester(selTitle, selNote);
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
  const res = await chai
    .request(Globals.app)
    .post(`/api/projects/${Globals.testProject._id}/subtasks`)
    .send(selectedTask);

  // Makes sure the response is good and the new task is valid.
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
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
  await chai.request(Globals.app).delete(`/api/tasks/${id}`);
  return true;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    // Creates the GET request.
    chai
      .request(Globals.app)
      .get('/api/tasks')
      .end((err, res) => {
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
    const taskResponse = await chai
      .request(Globals.app)
      .get(`/api/tasks/${testTask._id}`);
    assert.equal(taskResponse.status, 200);
    assert.exists(taskResponse.body, 'res.body not defined.');

    // Matchs the response to the created TaskDoc.
    const foundTask: TaskDoc = taskResponse.body;
    assert.equal(foundTask._id, testTask._id);
    assert.equal(foundTask.title, testTask.title);
    assert.equal(foundTask.note, testTask.note);
    assert.equal(foundTask.date, testTask.date);
  });
  it('Should return 400 if the id is not found', done => {
    chai
      .request(Globals.app)
      .get(`/api/tasks/42`)
      .end((err, res) => {
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
    const res = await chai
      .request(Globals.app)
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
    const deleteRes = await chai
      .request(Globals.app)
      .delete(`/api/tasks/${testTask._id}`);
    assert.equal(deleteRes.status, 200);
    assert.typeOf(deleteRes.body, 'object');
    assert.equal(deleteRes.body.ok, 1);

    await removeTask(testTask._id);
  });
});

describe('POST /id', () => {
  it('should add a task if ID is valid', async () => {
    // Creates the POST request for the main task.
    const container = await generateTestTask();
    const testTask = container.doc;
    const testSelection = container.values;

    // Cretaes a post request and sends it to the DB.
    const res = await chai
      .request(Globals.app)
      .post(`/api/tasks/${testTask._id}`)
      .send(testSelection);

    // Matches the new TaskDoc to the initial TaskDoc.
    assert.equal(res.status, 201);
    assert.typeOf(res.body, 'object');
    assert.equal(res.body._id, testTask._id);
    assert.equal(res.body.title, testTask.title);
    assert.equal(res.body.note, testTask.note);

    await removeTask(testTask._id);
  });
  it('should not add a task if id is invalid', async () => {
    const container = await generateTestTask();
    const testTask = container.doc;

    const res = await chai
      .request(Globals.app)
      .post(`/api/tasks/${testTask._id}dfkjns`)
      .send({
        title: 'bad task title',
        note: 'bad task note',
      });
    assert.equal(res.status, 400);
    const checkForTask = await chai
      .request(Globals.app)
      .get(`/api/tasks/${res.body._id}`);
    assert.typeOf(checkForTask.body, 'object');
    assert.equal(checkForTask.status, 400);
    await removeTask(testTask._id);
  });
});
