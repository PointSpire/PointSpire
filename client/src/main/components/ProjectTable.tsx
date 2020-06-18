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
  tasks: TaskObjects;
}

export interface ProjectTableState {
  projectTableOpen: boolean;
}

class ProjectTable extends React.Component<
  ProjectTableProps,
  ProjectTableState
> {
  constructor(props: ProjectTableProps) {
    super(props);
    this.state = {
      projectTableOpen: true,
    };
  }

  render() {
    const { projects, tasks } = this.props;
    const { projectTableOpen } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              {/* This will be removed when the state has something to do. */}
              {/* eslint-disable-next-line */}
              <TableCell>{`Remove Later! ${projectTableOpen}`}</TableCell>
              <TableCell>Title</TableCell>
              <TableCell align="right">Note</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">{projects.id}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Object.values(projects).map(projectDoc => {
              return <ProjectRow project={projectDoc} tasks={tasks} />;
            })}
          </TableBody>
          <TableBody />
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
