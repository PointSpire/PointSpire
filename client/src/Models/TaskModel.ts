interface TaskModel {
  id: string;
  title: string;
  note: string;
  date: Date;
  subtasks: TaskModel[];
}

class TaskModel {
  constructor() {
    this.id = '';
    this.title = '';
    this.note = '';
    this.date = new Date(0, 0, 0, 0, 0, 0, 0);
    this.subtasks = [];
  }

  public static buildTask(
    id: string,
    title: string,
    note: string,
    date: Date,
    subtasks: TaskModel[]
  ): TaskModel {
    return {
      id,
      title,
      note,
      date,
      subtasks,
    } as TaskModel;
  }
}

export default TaskModel;
