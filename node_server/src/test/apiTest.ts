import chai from 'chai';
import chaiHttp from 'chai-http';
import app from '../../app';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

/**
 * Waits for the server to be started before running tests.
 */
before(done => {
  app.on('started', () => {
    done();
  })
});

describe('/api endpoint', () => {
  describe('GET /tasks', () => {
    it('should get all tasks from the MongoDB', (done) => {
      chai.request(app)
        .get("/api/tasks")
        .end((err, res) => {
          assert.isNull(err);
          assert.equal(res.status, 200);
          assert.typeOf(res.body, 'array');
          done();
        })
    })
  })
})