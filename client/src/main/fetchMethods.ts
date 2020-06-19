/**
 * This file is used to store the fetch requests that access the database
 */

import { ProjectObjects, Project, AllUserData, User } from './dbTypes';

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
  buildUrl(api: string, id: string | null) {
    let output = this.baseServerUrl;
    switch (api) {
      case 'users':
        output += this.api.users;
        break;
      case 'projects':
        output += this.api.projects;
        break;
      case 'tasks':
        output += this.api.tasks;
        break;
      default:
        break;
    }
    output += id === null ? '' : id;
    return output;
  },
};

export type FetchMethods = {
  getProjects: () => Promise<ProjectObjects>;
  postProjects: () => Promise<Project>;
};

export async function getProjects(id: string): Promise<ProjectObjects> {
  const url = fetchData.buildUrl('projects', id);
  // console.log(url);
  const data = await fetch(url);
  const projData = (await data.json()) as ProjectObjects;
  return projData;
}

export function getUserData(id: string): Promise<AllUserData> {
  const userId =
    process.env.REACT_APP_ENV === 'LOCAL_DEV' ? fetchData.testUser : id;
  return new Promise<AllUserData>((resolve, reject) => {
    fetch(fetchData.buildUrl('users', userId))
      .then(res => res.json())
      .then(data => resolve(data as AllUserData))
      .catch(err => reject(err));
  });
}

export function getUser(id: string): Promise<User> {
  return new Promise<User>((resolve, reject) => {
    fetch(fetchData.buildUrl('users', id))
      .then(res => res.json())
      .then(data => resolve(data as User))
      .catch(err => reject(err));
  });
}

export function getRequest<T>(id: string, end: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    fetch(fetchData.buildUrl(end, id))
      .then(res => res.json())
      .then(data => resolve(data as T))
      .catch(err => reject(err));
  });
}

export async function postNewProject(
  userId: string,
  projectTitle: string
): Promise<Project> {
  const userResponse = await getRequest<User>(userId, 'users');
  if (userResponse) {
    const tempProject = {
      title: projectTitle,
      note: '',
    };
    const url = fetchData.buildUrl('projects', userId) + fetchData.api.subTasks;
    const projectRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(tempProject),
    });
    const newProject = (await projectRes.json()) as Project;
    return newProject;
  }
  throw new Error('User not found.');
}
