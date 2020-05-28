import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { ProjectDoc } from '../main/models/project';

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
      projectTitle: 'testProject',
    });
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
  assert.equal(res.body.title, 'testProject');
  const testProject: ProjectDoc = res.body;
  return testProject;
}

describe('GET /api/tasks', () => {
  it('should get all tasks from the MongoDB', done => {
    chai
      .request(Globals.app)
      .get('/api/tasks')
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 200);
        assert.typeOf(res.body, 'array');
        done();
      });
  });
});
describe('api/projects', () => {
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
    it('should modify a project by adding the content of the body', done => {
      assert.fail('Not implemented yet');
      done();
    });
  });
  describe('DELETE /id', () => {
    it(
      'should delete the project with the id from the projects collection and' +
        ' from the user which has that project',
      done => {
        assert.fail('Not implemented');
        done();
      }
    );
  });
  describe('POST /id/subtasks', () => {
    it('should add a subtask if valid content is sent', done => {
      assert.fail('Not implemented');
      done();
    });
    it('should not add a subtask if invalid content is sent', done => {
      assert.fail('Not implemented');
      done();
    });
  });
});
