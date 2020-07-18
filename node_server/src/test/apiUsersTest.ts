import chai from 'chai';
import chaiHttp from 'chai-http';
import Globals from './Globals';
import { ProjectDoc } from '../main/models/project';
import { UserDoc, AllUserData } from '../main/models/user';
import { TaskDoc } from '../main/models/task';

// Configure chai
chai.use(chaiHttp);

// Use the assert style
const assert = chai.assert;

/**
 * Generates a new testUser UserDoc by making a request to the server. It
 * also asserts that the returned item came back correctly.
 */
async function generateTestUser(): Promise<UserDoc> {
  const res = await Globals.requester.post(`/api/users`).send({
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
  await Globals.requester.delete(`/api/users/${id}`);
  return true;
}

describe('GET', () => {
  it('should return a 405 and request an ID', done => {
    Globals.requester.get('/api/users').end((err, res) => {
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
  it('should return the user data specified by the given id if the id is valid', async () => {
    const res = await Globals.requester.get(
      `/api/users/${Globals.testUser._id}`
    );
    assert.equal(res.status, 200);
    const returnedUser: UserDoc = res.body.user;
    assert.equal(returnedUser.userName, Globals.testUser.userName);
    assert.equal(returnedUser._id, Globals.testUser._id);
    assert.equal(returnedUser.firstName, Globals.testUser.firstName);
    assert.equal(returnedUser.lastName, Globals.testUser.lastName);
  });
  it('should return a 400 if the id is invalid', done => {
    Globals.requester.get(`/api/users/3`).end((err, res) => {
      assert.isNull(err);
      assert.equal(res.status, 400);
      done();
    });
  });
});

describe('PATCH /id', () => {
  it('should modify a user by adding the content of the body', async () => {
    const testUser = await generateTestUser();
    const res = await Globals.requester
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
      const projectAddRes = await Globals.requester
        .post(`/api/users/${testUser._id}/projects`)
        .send({
          title: 'Some project title',
        });
      assert.equal(projectAddRes.status, 201);
      assert.typeOf(projectAddRes.body, 'object');
      assert.equal(projectAddRes.body.title, 'Some project title');
      const addedProject: ProjectDoc = projectAddRes.body;

      // Send the delete request
      const deleteRes = await Globals.requester.delete(
        `/api/users/${testUser._id}`
      );
      assert.equal(deleteRes.status, 200);
      assert.typeOf(deleteRes.body, 'object');
      assert.equal(deleteRes.body.user._id, testUser._id);

      // Make sure the project has been deleted
      const projectDeleteRes = await Globals.requester.get(
        `/api/projects/${addedProject._id}`
      );
      assert.equal(projectDeleteRes.status, 400);

      await removeUser(testUser._id);
    }
  );
});

describe('POST /id/projects', () => {
  it('should add a project if valid content is sent', async () => {
    const testUser = await generateTestUser();
    const res = await Globals.requester
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

    // Add a task to the new project
    const taskAddRes = await Globals.requester
      .post(`/api/projects/${newProject._id}/subtasks`)
      .send({
        title: 'Some new task',
      });
    assert.equal(taskAddRes.status, 201);
    assert.typeOf(taskAddRes.body, 'object');
    assert.equal(taskAddRes.body.title, 'Some new task');
    const newTask: TaskDoc = taskAddRes.body;

    const userRes = await Globals.requester.get(`/api/users/${testUser._id}`);
    const returnedUserData: AllUserData = userRes.body;

    const matchedProject = returnedUserData.projects[newProject._id];
    assert.isTrue(matchedProject !== undefined);
    assert.isTrue(matchedProject.subtasks.includes(newTask._id));
    const matchedSubTask = returnedUserData.tasks[newTask._id];
    assert.isTrue(matchedSubTask !== undefined);
    await removeUser(testUser._id);
  });
  it('should not add a project if invalid content is sent', async () => {
    const testUser = await generateTestUser();
    const res = await Globals.requester
      .post(`/api/users/${testUser._id}/projects`)
      .send({
        note: 'Some project note',
      });
    assert.equal(res.status, 400);
    const userRes = await Globals.requester.get(`/api/users/${testUser._id}`);
    const returnedUser: UserDoc = userRes.body.user;
    assert.deepEqual(returnedUser, testUser);
    await removeUser(testUser._id);
  });
});

describe('DELETE /id/tags/tagId', () => {
  it('should delete a tag from the user and from the users projects and tasks when they have the tag', async () => {
    const testUser = await generateTestUser();

    // Add a tag to the user
    testUser.currentTags.someId = {
      name: 'SomeTag',
      color: 'SomeColor',
    };

    const userPatchRes = await Globals.requester
      .patch(`/api/users/${testUser._id}`)
      .send({
        currentTags: testUser.currentTags,
      });
    assert.equal(userPatchRes.status, 200);
    assert.deepEqual(userPatchRes.body, testUser);

    // Create a project with the tag
    const addProjectRes = await Globals.requester
      .post(`/api/users/${testUser._id}/projects`)
      .send({
        title: 'Some test project',
        tags: ['someId'],
      });
    assert.equal(addProjectRes.status, 201);
    assert.deepEqual(addProjectRes.body.tags, ['someId']);
    const testProject: ProjectDoc = addProjectRes.body;

    // Create a task with the tag
    const addTaskRes = await Globals.requester
      .post(`/api/projects/${testProject._id}/subtasks`)
      .send({
        title: 'Some test task',
        tags: ['someId'],
      });
    assert.equal(addTaskRes.status, 201);
    assert.deepEqual(addTaskRes.body.tags, ['someId']);
    const testTask: ProjectDoc = addTaskRes.body;

    // Delete the tag
    const deleteTagRes = await Globals.requester.delete(
      `/api/users/${testUser._id}/tags/someId`
    );

    assert.equal(deleteTagRes.status, 200);

    // Make sure the tag is gone from the user
    const userGetRes = await Globals.requester.get(
      `/api/users/${testUser._id}`
    );
    assert.deepEqual(userGetRes.body.user.currentTags, {});

    // Make sure the tag is gone from the project
    const projectGetRes = await Globals.requester.get(
      `/api/projects/${testProject._id}`
    );
    assert.deepEqual(projectGetRes.body.tags, []);

    // Make sure the tag is gone from the task
    const taskGetRes = await Globals.requester.get(
      `/api/tasks/${testTask._id}`
    );
    assert.deepEqual(taskGetRes.body.tags, []);

    // Remove the test user
    await removeUser(testUser._id);
  });

  it('should delete a tag from the filters of the user if it is set', async () => {
    const testUser = await generateTestUser();

    // Add a tag to the user
    testUser.currentTags.someId = {
      name: 'SomeTag',
      color: 'SomeColor',
    };

    testUser.filters.tagIdsToShow.push('someId');

    // Set the new tags for the user and the filter
    const userPatchRes = await Globals.requester
      .patch(`/api/users/${testUser._id}`)
      .send({
        currentTags: testUser.currentTags,
        filters: testUser.filters,
      });
    assert.equal(userPatchRes.status, 200);
    assert.deepEqual(userPatchRes.body, testUser);

    // Delete the tag
    const deleteTagRes = await Globals.requester.delete(
      `/api/users/${testUser._id}/tags/someId`
    );
    assert.equal(deleteTagRes.status, 200);

    // Make sure the tag is gone from the user and from the filter
    const userGetRes = await Globals.requester.get(
      `/api/users/${testUser._id}`
    );
    assert.deepEqual(userGetRes.body.user.currentTags, {});
    assert.deepEqual(userGetRes.body.user.filters.tagIdsToShow, []);

    // Remove the test user
    await removeUser(testUser._id);
  });
});
