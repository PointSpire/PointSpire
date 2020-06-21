/**
 * This file is used to store the fetch requests that access the database
 */

import { Project, AllUserData, User, Task, tasksAreEqual } from './dbTypes';

const fetchData = {
  baseServerUrl:
    process.env.REACT_APP_ENV === 'LOCAL_DEV'
      ? 'http://localhost:8055'
      : 'https://point-spire.herokuapp.com',
  testUser: '5eda8ef7846e21ba6013cb19',
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
 * expected the user to have a cookie with a valid session ID in it, so the
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
  const url = `${fetchData.baseServerUrl}/api/users/5eda8ef7846e21ba6013cb19`;
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

export async function patchProject(
  url: string,
  project: Project
): Promise<Project> {
  const { buildUrl, basicHeader } = fetchData;
  const fullUrl = buildUrl(url, project._id);
  const tempProject = project;
  delete tempProject._id;
  const projectRes = await fetch(fullUrl, {
    method: 'PATCH',
    headers: basicHeader,
    body: JSON.stringify(tempProject),
  });
  const updatedProject = (await projectRes.json()) as Project;
  return updatedProject;
}

export async function postNewTask(
  url: string,
  parentId: string,
  taskTitle: string
): Promise<Task> {
  const { buildUrl, basicHeader } = fetchData;
  const fullUrl = buildUrl(url, parentId);
  const newTask = {
    title: taskTitle,
    note: 'blank',
  };
  const taskRes = await fetch(fullUrl, {
    method: 'POST',
    headers: basicHeader,
    body: JSON.stringify(newTask),
  });
  const returnedTask = (await taskRes.json()) as Task;
  return returnedTask;
}
