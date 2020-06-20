/**
 * This file is used to store the fetch requests that access the database
 */

import { ProjectObjects, Project, AllUserData, User, Task } from './dbTypes';

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

export type FetchMethods = {
  getProjects: (id: string) => Promise<ProjectObjects>;
  getUserData: (id: string) => Promise<AllUserData>;
  getRequest: <T>(url: string, id: string) => Promise<T>;
  postNewProject: (userId: string, projectTitle: string) => Promise<Project>;
  patchProject: (url: string, project: Project) => Promise<Project>;
  postNewTask: (
    url: string,
    parentId: string,
    taskTitle: string
  ) => Promise<Task>;
};

export async function getProjects(id: string): Promise<ProjectObjects> {
  const url = fetchData.buildUrl(
    `${fetchData.baseServerUrl}/api/projects/~`,
    id
  );
  // console.log(url);
  const data = await fetch(url);
  const projData = (await data.json()) as ProjectObjects;
  return projData;
}

export function getUserData(id: string): Promise<AllUserData> {
  const userId =
    process.env.REACT_APP_ENV === 'LOCAL_DEV' ? fetchData.testUser : id;
  return new Promise<AllUserData>((resolve, reject) => {
    fetch(
      fetchData.buildUrl(
        `${fetchData.baseServerUrl}/api/users/~/projects`,
        userId
      )
    )
      .then(res => res.json())
      .then(data => resolve(data as AllUserData))
      .catch(err => reject(err));
  });
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
