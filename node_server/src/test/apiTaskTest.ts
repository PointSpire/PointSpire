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

// #region OLD - need to confirm class implementation before deletion.
// Selection for a random value
// const selection = {
//   titles: [
//     'just do it',
//     'get project done',
//     'try to help tony',
//     'fill my brain',
//   ],
//   notes: [
//     'why u no done',
//     'how much longer',
//     'idk what to do',
//     'my head hurts',
//   ],
//   length: 4,
// };

// /**
//  * Returns an object to use to run the tests.
//  * Its not necessary but i thought it would be fun.
//  *
//  * @returns {object} Object to use for the test.
//  */
// function selectTaskValues():  {
//   const titleRoll: number = Math.round(Math.random() * selection.length);
//   const noteRoll: number = Math.round(Math.random() * selection.length);

//   let selTitle = selection.titles[0];
//   let selNote = selection.notes[0];

//   if (titleRoll <= selection.length && titleRoll >= 0) {
//     selTitle = selection.titles[titleRoll];
//   }

//   if (noteRoll <= selection.length && noteRoll >= 0) {
//     selNote = selection.notes[noteRoll];
//   }

//   return {
//     title: selTitle,
//     note: selNote,
//   }
// }
// #endregion

const selectedTask = TaskTester.selectTaskValues();

/**
 * Generates a new testUser UserDoc by making a request to the server. It
 * also asserts that the returned item came back correctly.
 */
async function generateTestTask(): Promise<TaskDoc> {
  // const res = await chai.request(Globals.app).post(`/api/tasks`).send({
  //   title: 'someTestTask',
  // });
  const res = await chai
    .request(Globals.app)
    .post(`api/projects/${Globals.testProject._id}/subtasks`)
    .send(selectedTask);
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
  assert.equal(res.body.title, selectedTask.title);
  assert.equal(res.body.note, selectedTask.note);
  const testTask: TaskDoc = res.body;
  return testTask;
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
    const testTask = await generateTestTask();
    const taskResponse = await chai
      .request(Globals.app)
      .get(`api/tasks/${testTask._id}`);
    assert.equal(taskResponse.status, 200);
    assert.exists(taskResponse.body, 'res.body not defined.');

    assert.equal(taskResponse.body._id, testTask._id);
    assert.equal(taskResponse.body.title, testTask.title);
    assert.equal(taskResponse.body.note, testTask.note);
    assert.equal(taskResponse.body.date, testTask.date);
    assert.equal(taskResponse.body.subTask, testTask.subTask);
  });
  it('Should return 400 if the id is not found', done => {
    chai
      .request(Globals.app)
      .get(`api/tasks/42`)
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 400);
        done();
      });
  });
});

describe('PATCH /id', () => {
  it('should modify a task by adding the content of the body', async () => {
    const testTask = await generateTestTask();
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
    const testTask = await generateTestTask();

    const subTaskRes = await chai
      .request(Globals.app)
      .post(`/api/users/${testTask._id}`)
      .send({
        title: 'some subTask title',
      });
    assert.equal(subTaskRes.status, 200);
    assert.typeOf(subTaskRes.body, 'object');
    assert.equal(subTaskRes.body.title, 'some subTask title');
    const addedSubTask: TaskDoc = subTaskRes.body;

    const deleteRes = await chai
      .request(Globals.app)
      .delete(`/api/tasks/${testTask._id}`);
    assert.equal(deleteRes.status, 200);
    assert.typeOf(deleteRes.body, 'object');
    assert.equal(deleteRes.body._id, testTask._id);

    const taskDelRes = await chai
      .request(Globals.app)
      .get(`/api/tasks/${addedSubTask._id}`);
    assert.equal(taskDelRes.status, 400);

    await removeTask(testTask._id);
  });
});

describe('POST /id', () => {
  it('should add a task to a project or task if valid', async () => {
    // Generates the main task values.
    const testSelection = TaskTester.selectTaskValues();

    // Creates the POST request for the main task.
    const testTask = await generateTestTask();
    const res = await chai
      .request(Globals.app)
      .post(`/api/tasks/${testTask._id}`)
      .send(testSelection);

    // Check main task
    assert.equal(res.status, 201);
    assert.typeOf(res.body, 'object');
    assert.equal(res.body.title, testSelection.title);
    assert.equal(res.body.note, testSelection.note);

    // create task from returned POST response.
    const newMainTask: TaskDoc = res.body;
    const taskRes = await chai
      .request(`/api/tasks/${testTask._id}`)
      .get(`/api/tasks/${testTask._id}`);

    const returnedTask: TaskDoc = taskRes.body;
    assert.equal(returnedTask.subTask.includes(newMainTask._id), true);
    await removeTask(testTask._id);
  });
  it('should not add a task if id is invalid', async () => {
    const testTask = await generateTestTask();
    const res = await chai
      .request(Globals.app)
      .post(`/api/tasks/${testTask._id} + dfkjns`)
      .send({
        title: 'bad task title',
        note: 'bad task note',
      });
    assert.equal(res.status, 500);
    const checkForTask = await chai
      .request(Globals.app)
      .get(`/api/tasks/${testTask._id}`)
      .end((err, res) => {
        assert.isNotNull(err);
        assert.equal(checkForTask.status, 500);
        console.log(res);
      });
    await removeTask(testTask._id);
  });
});
