import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';

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
  require('./apiProjectsTest');
});
