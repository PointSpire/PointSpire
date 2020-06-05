import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { ProjectDoc } from '../main/models/project';
import { UserDoc } from '../main/models/user';
import { TaskDoc } from '../main/models/task';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

/**
 * Generates a testProject ProjectDoc by making a request to the server. It
 * also asserts that the returned item came back correctly.
 */
async function generateTestProject(): Promise<ProjectDoc> {
  const res = await chai
    .request(Globals.app)
    .post(`/api/users/${Globals.testUser._id}/projects`)
    .send({
      title: 'testProject',
    });
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
  assert.equal(res.body.title, 'testProject');
  const testProject: ProjectDoc = res.body;
  return testProject;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    chai
      .request(Globals.app)
      .get('/api/projects')
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 405);
        assert.equal(
          res.text,
          'Please specify a project ID by using /api/projects/24 where ' +
            '"24" is the ID of the project.'
        );
        done();
      });
  });
});
describe('GET /id', () => {
  it('should return the project specified by the given id if the id is valid', async () => {
    const testProject = await generateTestProject();
    const res = await chai
      .request(Globals.app)
      .get(`/api/projects/${testProject._id}`);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, testProject);
  });
  it('should return a 400 if the id is invalid', done => {
    chai
      .request(Globals.app)
      .get(`/api/projects/3`)
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 400);
        done();
      });
  });
});
describe('PATCH /id', () => {
  it('should modify a project by adding the content of the body', async () => {
    const testProject = await generateTestProject();
    const res = await chai
      .request(Globals.app)
      .patch(`/api/projects/${testProject._id}`)
      .send({
        note: 'Some test note',
        title: 'A new title',
      });
    assert.equal(res.status, 200);
    assert.typeOf(res.body, 'object');
    const returnedProject: ProjectDoc = res.body;
    assert.equal(returnedProject.note, 'Some test note');
    assert.equal(returnedProject.title, 'A new title');
  });
});
describe('DELETE /id', () => {
  it(
    'should delete the project with the id from the projects collection and' +
      ' from the user which has that project',
    async () => {
      const testProject = await generateTestProject();

      // Send the delete request
      const deleteRes = await chai
        .request(Globals.app)
        .delete(`/api/projects/${testProject._id}`);
      assert.equal(deleteRes.status, 200);
      assert.typeOf(deleteRes.body, 'object');
      assert.equal(deleteRes.body._id, testProject._id);

      // Check that the project doesn't come back
      const projectRes = await chai
        .request(Globals.app)
        .get(`/api/projects/${testProject._id}`);
      assert.equal(projectRes.status, 400);

      // Make sure the project is deleted out of the testUser projects
      const userRes = await chai
        .request(Globals.app)
        .get(`/api/users/${Globals.testUser._id}`);
      const returnedUserDoc: UserDoc = userRes.body;
      assert.equal(returnedUserDoc.projects.includes(testProject._id), false);
    }
  );
});
describe('POST /id/subtasks', () => {
  it('should add a subtask if valid content is sent', async () => {
    try {
      const testProject = await generateTestProject();
      const res = await chai
        .request(Globals.app)
        .post(`/api/projects/${testProject._id}/subtasks`)
        .send({
          title: 'Some new task',
          note: 'Some task note',
        });
      assert.equal(res.status, 201);
      assert.typeOf(res.body, 'object');
      assert.equal(res.body.title, 'Some new task');
      assert.equal(res.body.note, 'Some task note');
      const newTask: TaskDoc = res.body;
      const projectRes = await chai
        .request(Globals.app)
        .get(`/api/projects/${testProject._id}`);
      const returnedProject: ProjectDoc = projectRes.body;
      assert.equal(returnedProject.subtasks.includes(newTask._id), true);
    } catch (err) {
      assert.isNull(err);
    }
  });
  it('should not add a subtask if invalid content is sent', async () => {
    const testProject = await generateTestProject();
    const res = await chai
      .request(Globals.app)
      .post(`/api/projects/${testProject._id}/subtasks`)
      .send({
        note: 'Some task note',
      });
    assert.equal(res.status, 400);
    const projectRes = await chai
      .request(Globals.app)
      .get(`/api/projects/${testProject._id}`);
    const returnedProject: ProjectDoc = projectRes.body;
    assert.deepEqual(returnedProject, testProject);
  });
});
