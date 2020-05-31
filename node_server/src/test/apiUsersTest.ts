import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { ProjectDoc } from '../main/models/project';
import { UserDoc } from '../main/models/user';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

/**
 * Generates a new testUser UserDoc by making a request to the server. It
 * also asserts that the returned item came back correctly.
 */
async function generateTestUser(): Promise<UserDoc> {
  const res = await chai.request(Globals.app).post(`/api/users`).send({
    userName: 'someTestUser',
  });
  assert.typeOf(res.body, 'object');
  assert.typeOf(res.body._id, 'string');
  assert.equal(res.body.userName, 'someTestUser');
  const testUser: UserDoc = res.body;
  return testUser;
}

/**
 * Delets a user from the database by requesting it to be deleted by the
 * associated ID.
 *
 * @param {string} id the id of the user to delete
 */
async function removeUser(id: string): Promise<boolean> {
  await chai.request(Globals.app).delete(`/api/users/${id}`);
  return true;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    chai
      .request(Globals.app)
      .get('/api/users')
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 405);
        assert.equal(
          res.text,
          'Please specify a user ID by using /api/users/24 where ' +
            '"24" is the ID of the user.'
        );
        done();
      });
  });
});

describe('GET /id', () => {
  it('should return the user specified by the given id if the id is valid', async () => {
    const res = await chai
      .request(Globals.app)
      .get(`/api/users/${Globals.testUser._id}`);
    assert.equal(res.status, 200);
    const returnedUser: UserDoc = res.body;
    assert.equal(returnedUser.userName, Globals.testUser.userName);
    assert.equal(returnedUser._id, Globals.testUser._id);
    assert.equal(returnedUser.firstName, Globals.testUser.firstName);
    assert.equal(returnedUser.lastName, Globals.testUser.lastName);
  });
  it('should return a 400 if the id is invalid', done => {
    chai
      .request(Globals.app)
      .get(`/api/users/3`)
      .end((err, res) => {
        assert.isNull(err);
        assert.equal(res.status, 400);
        done();
      });
  });
});

describe('PATCH /id', () => {
  it('should modify a user by adding the content of the body', async () => {
    const testUser = await generateTestUser();
    const res = await chai
      .request(Globals.app)
      .patch(`/api/users/${testUser._id}`)
      .send({
        firstName: 'Some test name',
        lastName: 'Some test last name',
      });
    assert.equal(res.status, 200);
    assert.typeOf(res.body, 'object');
    const returnedUser: UserDoc = res.body;
    assert.equal(returnedUser.firstName, 'Some test name');
    assert.equal(returnedUser.lastName, 'Some test last name');
    await removeUser(testUser._id);
  });
});

describe('DELETE /id', () => {
  it(
    'should delete the user with the id from the users collection and' +
      ' all the projects and tasks under that user',
    async () => {
      const testUser = await generateTestUser();

      // Add a project to the user
      const projectAddRes = await chai
        .request(Globals.app)
        .post(`/api/users/${testUser._id}/projects`)
        .send({
          title: 'Some project title',
        });
      assert.equal(projectAddRes.status, 201);
      assert.typeOf(projectAddRes.body, 'object');
      assert.equal(projectAddRes.body.title, 'Some project title');
      const addedProject: ProjectDoc = projectAddRes.body;

      // Send the delete request
      const deleteRes = await chai
        .request(Globals.app)
        .delete(`/api/users/${testUser._id}`);
      assert.equal(deleteRes.status, 200);
      assert.typeOf(deleteRes.body, 'object');
      assert.equal(deleteRes.body._id, testUser._id);

      // Make sure the project has been deleted
      const projectDeleteRes = await chai
        .request(Globals.app)
        .get(`/api/projects/${addedProject._id}`);
      assert.equal(projectDeleteRes.status, 400);

      await removeUser(testUser._id);
    }
  );
});

describe('POST /id/projects', () => {
  it('should add a project if valid content is sent', async () => {
    const testUser = await generateTestUser();
    const res = await chai
      .request(Globals.app)
      .post(`/api/users/${testUser._id}/projects`)
      .send({
        title: 'Some new project',
        note: 'Some project note',
      });
    assert.equal(res.status, 201);
    assert.typeOf(res.body, 'object');
    assert.equal(res.body.title, 'Some new project');
    assert.equal(res.body.note, 'Some project note');
    const newProject: ProjectDoc = res.body;
    const userRes = await chai
      .request(Globals.app)
      .get(`/api/users/${testUser._id}`);
    const returnedUser: UserDoc = userRes.body;
    assert.equal(returnedUser.projects.includes(newProject._id), true);
    await removeUser(testUser._id);
  });
  it('should not add a project if invalid content is sent', async () => {
    const testUser = await generateTestUser();
    const res = await chai
      .request(Globals.app)
      .post(`/api/users/${testUser._id}/projects`)
      .send({
        note: 'Some project note',
      });
    assert.equal(res.status, 400);
    const userRes = await chai
      .request(Globals.app)
      .get(`/api/users/${testUser._id}`);
    const returnedUser: UserDoc = userRes.body;
    assert.deepEqual(returnedUser, testUser);
    await removeUser(testUser._id);
  });
});
