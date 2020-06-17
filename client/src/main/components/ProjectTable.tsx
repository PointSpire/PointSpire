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
// import { Table, Paper, TableRow } from 'material-ui';

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
    // this.addTask = this.addTask.bind(this);
    // this.mapTasks = this.mapTasks.bind(this);
  }

  // mapTasks(): JSX.Element | JSX.Element[] {
  //   const { tasks } = this.props;
  //   if (tasks !== (undefined || null) && tasks.length > 0) {
  //     return tasks.map(task => {
  //       return (
  //         <ListItem button key={task.id}>
  //           <ListItemText primary={task.title} />
  //           <ListItemText primary={task.note} />
  //         </ListItem>
  //       );
  //     });
  //   }
  //   return (
  //     <ListItem button={false} key="none">
  //       <ListItemText primary="No Tasks Found" />
  //     </ListItem>
  //   );
  // };

  // addTask(): void {
  //   // let tempTasks = tasks;
  //   // if (tempTasks === null) {
  //   //   tempTasks = [
  //   //     TaskModel.buildTask('', 'new', 'task', new Date(Date.now()), []),
  //   //   ];
  //   // } else {
  //   //   tempTasks.push(new TaskModel());
  //   // }
  //   // setTasks(tempTasks);

  // };

  render() {
    const { projects } = this.props;
    const { projectTableOpen } = this.state;
    return (
      <TableContainer component={Paper}>
        <Table aria-label="collapsible table">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>{projectTableOpen}</TableCell>
              <TableCell align="right">Calories</TableCell>
              <TableCell align="right">Fat&nbsp;(g)</TableCell>
              <TableCell align="right">Carbs&nbsp;(g)</TableCell>
              <TableCell align="right">Protein&nbsp;(g)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{projects}</TableBody>
        </Table>
      </TableContainer>
    );
  }
}

export default withStyles(styles, { withTheme: true })(ProjectTable);
