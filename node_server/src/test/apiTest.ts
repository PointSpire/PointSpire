import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { ProjectDoc } from '../main/models/project';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

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
    it('should return the project specified by the given id if the id is valid', done => {
      // Add a project to test
      chai
        .request(Globals.app)
        .post(`/api/users/${Globals.testUser._id}/projects`)
        .send({
          projectTitle: 'testProject',
        })
        .end((err, res) => {
          assert.isNull(err);
          assert.typeOf(res.body, 'object');
          assert.typeOf(res.body._id, 'string');
          assert.equal(res.body.title, 'testProject');
          const testProject: ProjectDoc = res.body;

          // Make sure the project is being returned
          chai
            .request(Globals.app)
            .get(`/api/projects/${testProject._id}`)
            .end((err, res) => {
              assert.isNull(err);
              assert.equal(res.status, 200);
              assert.deepEqual(res.body, testProject);
              done();
            });
        });
    });
  });
});
