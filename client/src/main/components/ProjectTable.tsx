import React from 'react';
import {
  Button,
  TableContainer,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  Table,
  Collapse,
  TextField,
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
      alignItems: 'center',
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
    label: {
      alignSelf: 'center',
    },
  });
}

export interface ProjectTableProps extends WithStyles<typeof styles> {
  projects: ProjectObjects;
  tasks: TaskObjects;

  // updateUserData: (projectData: ProjectObjects) => void;
  // createNewProject: () => void;
  addProject: (newTitle: string) => void;
  handleChange: (taskId: string, inputId: string, value: string) => void;
}

export interface ProjectTableState {
  changeCount: number;
  addProjectOpen: boolean;
  newProjectTitle: string;
}

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);
    this.state = {
      changeCount: 0,
      addProjectOpen: false,
      newProjectTitle: '',
    };
    // this.handleInputChange = this.handleInputChange.bind(this);
  }

  // public handleInputChange = (
  //   taskId: string,
  //   inputId: string,
  //   value: string
  // ) => {
  //   const { tasks } = this.state;
  //   const currentTasks = tasks;
  //   const foundTask = currentTasks[taskId];
  //   switch (inputId) {
  //     case 'title-input':
  //       foundTask.title = value;
  //       break;
  //     case 'note-input':
  //       foundTask.note = value;
  //       break;
  //     default:
  //       break;
  //   }
  //   currentTasks[taskId] = foundTask;
  //   this.setState(currState => ({
  //     changeCount: currState.changeCount + 1,
  //   }));
  // };

  render() {
    const { classes, projects, tasks, addProject, handleChange } = this.props;
    const { addProjectOpen, newProjectTitle, changeCount } = this.state;
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
            {Object.values(projects).map(projectDoc => {
              return (
                <ProjectRow
                  project={projectDoc}
                  tasks={tasks}
                  handleChange={handleChange}
                />
              );
            })}
            <Collapse in={addProjectOpen} timeout="auto">
              <Paper>
                <TextField
                  id="new-project-title"
                  label="New Project Title"
                  value={newProjectTitle}
                  onChange={e => {
                    this.setState({
                      newProjectTitle: e.target.value,
                    });
                  }}
                  variant="outlined"
                  size="small"
                />
                <Button
                  variant="contained"
                  onClick={() => addProject(newProjectTitle)}
                >
                  Done
                </Button>
              </Paper>
            </Collapse>
            <Button
              className={classes.label}
              variant="outlined"
              fullWidth
              onClick={() => {
                this.setState(prev => {
                  return {
                    addProjectOpen: !prev.addProjectOpen,
                  };
                });
              }}
            >
              {addProjectOpen ? 'Cancel' : 'Create Project'}
            </Button>
          </TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
