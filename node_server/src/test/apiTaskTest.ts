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
  private static selection = {
    titles: [
      'just do it',
      'get project done',
      'try to help tony',
      'fill my brain',
    ],
    notes: [
      'why u no done',
      'how much longer',
      'idk what to do',
      'my head hurts',
    ],
    emptyString: '',
    length: 4,
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
    const titleRoll: number = Math.round(Math.random() * this.selection.length);
    const noteRoll: number = Math.round(Math.random() * this.selection.length);

    let selTitle = this.selection.titles[0];
    let selNote = this.selection.notes[0];

    if (titleRoll <= this.selection.length && titleRoll >= 0) {
      selTitle = this.selection.titles[titleRoll];
    }

    if (noteRoll <= this.selection.length && noteRoll >= 0) {
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
  const selectedTask = TaskTester.selectTaskValues();

  const res = await chai
    .request(Globals.app)
    .post(`/api/projects/${Globals.testProject._id}/subtasks`)
    .send(selectedTask);
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
  assert.equal(res.body.title, selectedTask.title);
  assert.equal(res.body.note, selectedTask.note);
  const testTask: TaskDoc = res.body;
  return new TaskContainer(testTask, selectedTask);
}

/**
 * Delets a user from the database by requesting it to be deleted by the
 * associated ID.
 *
 * @param {string} id the id of the user to delete
 */
async function removeTask(id: string): Promise<boolean> {
  await chai.request(Globals.app).delete(`/api/tasks/${id}`);
  return true;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    chai
      .request(Globals.app)
      .get('/api/tasks')
      .end((err, res) => {
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
    const container = await generateTestTask();
    const testTask = container.doc;

    const taskResponse = await chai
      .request(Globals.app)
      .get(`/api/tasks/${testTask._id}`);
    assert.equal(taskResponse.status, 200);
    assert.exists(taskResponse.body, 'res.body not defined.');

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
    const container = await generateTestTask();
    const testTask = container.doc;
    const selectedTask = container.values;

    const res = await chai
      .request(Globals.app)
      .patch(`/api/tasks/${testTask._id}`)
      .send(selectedTask);
    assert.equal(res.status, 200);
    assert.typeOf(res.body, 'object');
    const returnedTask: TaskDoc = res.body;
    assert.equal(returnedTask.title, selectedTask.title);
    assert.equal(returnedTask.note, selectedTask.note);
    await removeTask(returnedTask._id);
  });
});

describe('DELETE /id', () => {
  it('should delete a task and any subtasks that are associated with it.', async () => {
    const container = await generateTestTask();
    const testTask = container.doc;

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

    const res = await chai
      .request(Globals.app)
      .post(`/api/tasks/${testTask._id}`)
      .send(testSelection);

    // Check main task
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
