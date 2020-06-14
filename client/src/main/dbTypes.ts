type Document = {
  _id: string;
  __v: number;
};

export interface User extends Document {
  projects: Array<Project>;
  dateCreated: Date;
  userName: string;
}

export type Project = Task;

export interface Task extends Document {
  subtasks: Array<Task>;
  dateCreated: Date;
  title: string;
}
