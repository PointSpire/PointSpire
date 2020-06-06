import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

describe('POST /api/users', () => {
  it('should create a new user and add a test project', async () => {
    try {
      const userResponse = await chai
        .request(Globals.app)
        .post('/api/users')
        .send({
          userName: 'testUser',
        });
      assert.equal(userResponse.status, 201);
      assert.typeOf(userResponse.body, 'object');
      assert.typeOf(userResponse.body._id, 'string');
      assert.equal(userResponse.body.userName, 'testUser');
      Globals.testUser = userResponse.body;

      const prjectResponse = await chai
        .request(Globals.app)
        .post(`/api/users/${Globals.testUser._id}/projects`)
        .send({
          title: 'Test Project',
        });
      assert.equal(prjectResponse.status, 201);
      assert.typeOf(prjectResponse.body, 'object');
      assert.typeOf(prjectResponse.body._id, 'string');
      assert.equal(prjectResponse.body.title, 'Test Project');
      Globals.testProject = prjectResponse.body;
    } catch (err) {
      assert.isNull(err);
    }
  });
});
