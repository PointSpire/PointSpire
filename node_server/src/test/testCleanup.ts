import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';

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
          assert.equal(res.body.user._id, testUser._id);
          assert.equal(res.body.user.userName, testUser.userName);
          done();
        });
    } else {
      done(new Error(`testUser wasn't defined for this session of tests.`));
    }
  });
});
