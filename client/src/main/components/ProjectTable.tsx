import React from 'react';
import {
  // Button,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Table,
} from '@material-ui/core/';
import {
  Theme,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core/styles';
import { ProjectObjects, TaskObjects } from '../dbTypes';
import ProjectRow from './ProjectRow';

/* This eslint comment is not a good solution, but the alternative seems to be 
ejecting from create-react-app */
// eslint-disable-next-line
function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  });
}

export interface ProjectTableProps extends WithStyles<typeof styles> {
  projects: ProjectObjects;
  projectIds: string[];
  tasks: TaskObjects;

  // updateUserData: (projectData: ProjectObjects) => void;
  // createNewProject: () => void;
}

export interface ProjectTableState {
  projects: ProjectObjects;
  projectIds: string[];
  tasks: TaskObjects;
  changeCount: number;
}

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);
    this.state = {
      changeCount: 0,
      projects: props.projects,
      projectIds: props.projectIds,
      tasks: props.tasks,
    };
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  public handleInputChange = (
    taskId: string,
    inputId: string,
    value: string
  ) => {
    const { tasks } = this.state;
    const currentTasks = tasks;
    const foundTask = currentTasks[taskId];
    switch (inputId) {
      case 'title-input':
        foundTask.title = value;
        break;
      case 'note-input':
        foundTask.note = value;
        break;
      default:
        break;
    }
    currentTasks[taskId] = foundTask;
    this.setState(currState => ({
      tasks: currentTasks,
      changeCount: currState.changeCount + 1,
    }));
  };

  render() {
    // const { projects, projectIds, tasks } = this.props;
    const { changeCount, projects, projectIds, tasks } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              {/* This will be removed when the state has something to do. */}
              {/* eslint-disable-next-line */}
              <TableCell>{`Remove Later! ${changeCount}`}</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="right">Note</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">{projects.id}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projectIds.map(project => (
              <ProjectRow
                project={projects[project]}
                tasks={tasks}
                handleChange={this.handleInputChange}
              />
            ))}
          </TableBody>
          <TableBody />
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
