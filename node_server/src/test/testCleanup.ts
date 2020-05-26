import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './globals';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

describe('DELETE /api/users/id', () => {
  it('should delete a user', done => {
    const testUser = Globals.testUser;
    if (testUser) {
      chai
        .request(Globals.app)
        .delete(`/api/users/${testUser._id}`)
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'object');
          assert.deepEqual(res.body, testUser);
          done();
        });
    } else {
      done(new Error(`testUser wasn't defined for this session of tests.`));
    }
  });
});
