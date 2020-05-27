import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

describe('POST /api/users', () => {
  it('should create a new user', done => {
    chai
      .request(Globals.app)
      .post('/api/users')
      .send({
        userName: 'testUser',
      })
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 201);
        assert.typeOf(res.body, 'object');
        assert.typeOf(res.body._id, 'string');
        assert.equal(res.body.userName, 'testUser');
        Globals.testUser = res.body;
        done();
      });
  });
});
