import React, { useState } from 'react';
import {
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  Grid,
  Card,
  Collapse,
} from '@material-ui/core';
import { Project, TaskObjects, Task } from '../logic/dbTypes';
import TaskRow from './TaskRow';
import { SetTaskFunction, SetTasksFunction, SetProjectFunction } from '../App';
import { postNewTask, deleteTask, patchProject } from '../logic/fetchMethods';
import scheduleCallback from '../logic/savingTimer';
import NoteInput from './NoteInput';
import DateInput from './DateInput';
import SimpleTextInput from './SimpleTextInput';
import TaskMenu from './TaskMenu/TaskMenu';
import sortingFunctions from '../logic/sortingFunctions';
import PriorityButton from './PriorityButton/PriorityButton';
import TaskExpanderButton from './TaskExpanderButton';

function styles(theme: Theme) {
  return createStyles({
    root: {
      display: 'flex',
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    flexGrow: {
      flexGrow: 1,
    },
    card: {
      flexGrow: 1,
      padding: theme.spacing(1),
      marginTop: theme.spacing(1),
      marginRight: theme.spacing(1),
      marginLeft: theme.spacing(1),
    },
    nested: {
      marginLeft: theme.spacing(2),
    },
  });
}

export interface ProjectRowProps extends WithStyles<typeof styles> {
  project: Project;
  tasks: TaskObjects;
  setTask: SetTaskFunction;
  setTasks: SetTasksFunction;
  setProject: SetProjectFunction;
  deleteThisProject: () => Promise<void>;
}

const ProjectRow = (props: ProjectRowProps) => {
  const {
    project,
    classes,
    tasks,
    setTask,
    setTasks,
    setProject,
    deleteThisProject,
  } = props;

  const [sortBy, setSortBy] = useState('Priority');
  const [subTasksOpen, setSubTasksOpen] = useState(false);

  /**
   * Saves the project in state to the server and logs to the console what
   * happened.
   */
  function saveProject(): void {
    patchProject(project)
      .then(result => {
        if (result) {
          // eslint-disable-next-line
          console.log('Project was successfully saved to the server');
        } else {
          // eslint-disable-next-line
          console.log(
            'Project was not saved to the server. There was an error.'
          );
        }
      })
      .catch(err => {
        // eslint-disable-next-line
        console.error(err);
      });
  }

  function saveDueDate(newDate: Date | null): void {
    project.dueDate = newDate;
    setProject(project);
    scheduleCallback(`${project._id}.saveProject`, saveProject);
  }

  function saveStartDate(newDate: Date | null): void {
    project.startDate = newDate;
    setProject(project);
    scheduleCallback(`${project._id}.saveProject`, saveProject);
  }

  function savePriority(newPriority: number): void {
    project.priority = newPriority;
    setProject(project);
    scheduleCallback(`${project._id}.saveProject`, saveProject);
  }

  /**
   * Generates a function which can be used to modify the specified `property`
   * of the project and schedule it to be saved on the server.
   *
   * @param {'note' | 'title'} property the property to modify on the project state
   * @returns {(newText: string) => void} the function which can be used to
   * save the specified `property` as long as the property is a string type
   */
  function saveText(property: 'note' | 'title') {
    return (newText: string): void => {
      project[property] = newText;
      setProject(project);
      scheduleCallback(`${project._id}.saveProject`, saveProject);
    };
  }

  /**
   * Adds a new task to this project on the server and in state.
   *
   * @param {string} newTitle the title of the new task
   */
  async function addSubTask(newTitle: string): Promise<void> {
    // Make the request for the new task
    const newTask = await postNewTask('project', project._id, newTitle);

    // Add the new task to the task objects
    tasks[newTask._id] = newTask;
    setTasks(tasks);

    // Add the new task to the project
    project.subtasks.push(newTask._id);
    setProject(project);
  }

  /**
   * Deletes the given task from state and from the server.
   *
   * @param {Task} task the task to delete
   */
  async function deleteSubTask(task: Task): Promise<void> {
    // Delete the task from state first
    delete tasks[task._id];
    setTasks(tasks);
    project.subtasks.splice(project.subtasks.indexOf(task._id), 1);
    setProject(project);

    // Make the request to delete the task
    await deleteTask(task);
  }

  return (
    <>
      <div className={classes.root}>
        <TaskExpanderButton
          open={subTasksOpen}
          setOpen={setSubTasksOpen}
          parent={project}
        />
        <Card className={`${classes.card}`} raised key={project._id}>
          <Grid container justify="flex-start" alignItems="center">
            <Grid
              container
              spacing={2}
              wrap="nowrap"
              alignItems="center"
              justify="flex-start"
            >
              <Grid
                item
                className={classes.flexGrow}
                key={`${project._id}.title`}
              >
                <SimpleTextInput
                  label="Project Title"
                  value={project.title}
                  saveValue={saveText('title')}
                />
              </Grid>
              <Grid item>
                <PriorityButton
                  savePriority={savePriority}
                  priority={project.priority}
                  projectOrTaskTitle={project.title}
                />
              </Grid>
              <Grid item>
                <DateInput
                  label="Start Date"
                  date={project.startDate}
                  saveDate={saveStartDate}
                />
              </Grid>
              <Grid item>
                <DateInput
                  label="Due Date"
                  date={project.dueDate}
                  saveDate={saveDueDate}
                />
              </Grid>
              <Grid item>
                <TaskMenu
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  deleteTask={deleteThisProject}
                  addSubTask={addSubTask}
                />
              </Grid>
            </Grid>

            <Grid item className={classes.flexGrow} key={`${project._id}.note`}>
              <NoteInput
                saveNote={saveText('note')}
                note={project.note}
                label="Project Note"
              />
            </Grid>
          </Grid>
        </Card>
      </div>
      <div className={classes.nested}>
        <Collapse in={subTasksOpen} timeout="auto" className={classes.flexGrow}>
          {Object.values(tasks)
            .filter(task => project.subtasks.includes(task._id))
            .sort(sortingFunctions[sortBy])
            .map(task => (
              <TaskRow
                key={task._id}
                setTasks={setTasks}
                setTask={setTask}
                task={task}
                tasks={tasks}
                deleteTask={deleteSubTask}
              />
            ))}
        </Collapse>
      </div>
    </>
  );
};

export default withStyles(styles, { withTheme: true })(ProjectRow);
