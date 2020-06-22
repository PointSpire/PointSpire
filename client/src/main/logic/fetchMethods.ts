/**
 * This file is used to store the fetch requests that access the database
 */

import {
  Project,
  AllUserData,
  User,
  Task,
  tasksAreEqual,
  projectsAreEqual,
} from './dbTypes';

const fetchData = {
  baseServerUrl:
    process.env.REACT_APP_ENV === 'LOCAL_DEV' ||
    process.env.REACT_APP_ENV === 'LOCAL'
      ? 'http://localhost:8055'
      : 'https://point-spire.herokuapp.com',
  /**
   * Used just for LOCAL_DEV, this is a manually created user.
   */
  testUser: '5eefe797ecd8e59379c172a8',
  api: {
    users: '/api/users/',
    tasks: '/api/tasks/',
    projects: '/api/projects/',
    subTasks: '/subtasks',
  },
  basicHeader: {
    'Content-Type': 'application/json',
  },
  /**
   * Places the ID in the URL.
   * @param {string} url The URL that accesses the api. Use a ~ to specify the id location.
   * @param {string | null} id The ID to replace at the ~ location, or null to skip.
   */
  buildUrl(url: string, id: string | null): string {
    const regEx = /(?<=\/)~/;
    let output = url;
    if (id && regEx.test(url)) {
      output = url.replace(regEx, id);
    }
    return output;
  },
};

/**
 * The base url for the server.
 */
export const { baseServerUrl } = fetchData;

/**
 * Gets the project with the specified ID.
 *
 * @param {string} id the id of the project to retrieve data for
 */
export async function getProject(id: string): Promise<Project> {
  const url = fetchData.buildUrl(
    `${fetchData.baseServerUrl}/api/projects/~`,
    id
  );
  const data = await fetch(url);
  const projData = (await data.json()) as Project;
  return projData;
}

/**
 * Makes a patch request to the server with the given task.
 *
 * @param {Task} task the task to send to update on the server
 * @returns {Promise<boolean>} true if succeeded and false if not
 */
export async function patchTask(task: Task): Promise<boolean> {
  const url = fetchData.buildUrl(
    `${fetchData.baseServerUrl}/api/tasks/~`,
    task._id
  );
  const res = await fetch(url, {
    method: 'PATCH',
    headers: fetchData.basicHeader,
    body: JSON.stringify(task),
  });
  const returnedTask = (await res.json()) as Task;
  if (tasksAreEqual(task, returnedTask)) {
    return true;
  }
  return false;
}

/**
 * Gets the user data from the server by using the current code in the user's
 * url path. If the code isn't there, then it makes a request to `/api/users`
 * expecting the user to have a cookie with a valid session ID in it, so the
 * server returns the correct AllUserData object.
 */
export async function getUserData(): Promise<AllUserData> {
  const githubCodeRegEx = /\?code=(.*)/;
  const githubCodeMatch = githubCodeRegEx.exec(window.location.href);
  let githubCode = '';
  if (githubCodeMatch) {
    githubCode = githubCodeMatch && githubCodeMatch[1];
  }
  if (githubCode !== '') {
    const url = `${fetchData.baseServerUrl}/auth/github`;
    const userDocRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: githubCode,
      }),
      credentials: 'include',
    });
    const user: User = (await userDocRes.json()) as User;
    const getUserUrl = `${fetchData.baseServerUrl}/api/users/${user._id}`;
    const res = await fetch(getUserUrl);
    const data = (await res.json()) as AllUserData;
    return data;
  }
  const url = `${fetchData.baseServerUrl}/api/users`;
  const res = await fetch(url, {
    method: 'GET',
    credentials: 'include',
  });
  const data = (await res.json()) as AllUserData;
  return data;
}

/**
 * Gets data for a test user. This is setup just for development purposes
 * so the client always gets a user.
 */
export async function getTestUserData(): Promise<AllUserData> {
  const url = `${fetchData.baseServerUrl}/api/users/${fetchData.testUser}`;
  const res = await fetch(url);
  const data = (await res.json()) as AllUserData;
  return data;
}

export function getUser(id: string): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    fetch(fetchData.buildUrl(`${fetchData.baseServerUrl}/api/users/~`, id))
      .then(res => res.json())
      .then(data => resolve(data as User))
      .catch(err => reject(err));
  });
}

export function getRequest<T>(url: string, id: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    fetch(fetchData.buildUrl(url, id))
      .then(res => res.json())
      .then(data => resolve(data as T))
      .catch(err => reject(err));
  });
}

/**
 * Makes a post request to the server to add a new project with the given title.
 *
 * @param {string} userId the ID of the user to add this project to
 * @param {string} projectTitle the title of the new project
 */
export async function postNewProject(
  userId: string,
  projectTitle: string
): Promise<Project> {
  const tempProject = {
    title: projectTitle,
  };
  const url = fetchData.buildUrl(
    `${fetchData.baseServerUrl}/api/users/~/projects`,
    userId
  );
  const projectRes = await fetch(url, {
    method: 'POST',
    headers: fetchData.basicHeader,
    body: JSON.stringify(tempProject),
  });
  const newProject = (await projectRes.json()) as Project;
  return newProject;
}

/**
 * Parses the dates returned by a server call into actual date objects. This
 * is needed becuase the data is sent via JSON, and needs to be re-constructed
 * into a class object.
 *
 * @param {Task | Project} returnedObject the task or project to convert the
 * dates for
 * @returns {Task | Project} the converted original object
 */
function parseReturnedDates(returnedObject: Task | Project): Task {
  const convertedObject = returnedObject;
  if (returnedObject.startDate) {
    convertedObject.startDate = new Date(returnedObject.startDate);
  }
  if (returnedObject.dueDate) {
    convertedObject.dueDate = new Date(returnedObject.dueDate);
  }
  return convertedObject;
}

/**
 * Makes a patch request to the server with the given project.
 *
 * @param {Project} project the project to send to update on the server
 * @returns {Promise<boolean>} true if succeeded and false if not
 */
export async function patchProject(project: Task): Promise<boolean> {
  const url = fetchData.buildUrl(
    `${fetchData.baseServerUrl}/api/projects/~`,
    project._id
  );
  const res = await fetch(url, {
    method: 'PATCH',
    headers: fetchData.basicHeader,
    body: JSON.stringify(project),
  });
  const returnedProject = (await res.json()) as Task;
  const parsedProject = parseReturnedDates(returnedProject);
  if (projectsAreEqual(project, parsedProject)) {
    return true;
  }
  return false;
}

/**
 * Makes a post request to the server with the new task title and returns
 * the new Task that the server produces.
 *
 * @param {"task" | "project"} parentType the type of the parent that the task
 * is being attached to
 * @param {string} parentId the id of the parent
 * @param {string} taskTitle the title of the new task
 * @returns {Promise<Task>} the Task that the server produced
 */
export async function postNewTask(
  parentType: 'task' | 'project',
  parentId: string,
  taskTitle: string
): Promise<Task> {
  const { basicHeader } = fetchData;
  let fullUrl: string;
  if (parentType === 'project') {
    fullUrl = `${baseServerUrl}/api/projects/${parentId}/subtasks`;
  } else {
    fullUrl = `${baseServerUrl}/api/tasks/${parentId}/subtasks`;
  }
  const newTask = {
    title: taskTitle,
  };
  const taskRes = await fetch(fullUrl, {
    method: 'POST',
    headers: basicHeader,
    body: JSON.stringify(newTask),
  });
  const returnedTask = (await taskRes.json()) as Task;
  const parsedTask = parseReturnedDates(returnedTask);

  return parsedTask;
}

/**
 * Deletes the given task from the server and returns the successfully deleted
 * task.
 *
 * @param {Task} task the task to delete
 * @returns {Promise<Task>} the successfully deleted Task
 */
export async function deleteTask(task: Task): Promise<Task> {
  const { basicHeader } = fetchData;
  const fullUrl = `${baseServerUrl}/api/tasks/${task._id}`;
  const res = await fetch(fullUrl, {
    method: 'DELETE',
    headers: basicHeader,
  });
  const returnedTask = (await res.json()) as Task;
  return returnedTask;
}
