import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './globals';

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
describe('GET /api/projects', () => {
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
