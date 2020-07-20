import React, { MouseEvent } from 'react';
import {
  Grid,
  List,
  Paper,
  ListItem,
  Typography,
  createStyles,
  Theme,
  WithStyles,
  withStyles,
} from '@material-ui/core';
import UserData from '../../clientData/UserData';

function styles(theme: Theme) {
  return createStyles({
    itemPrimary: {
      backgroundColor: theme.palette.primary.light,
      margin: theme.spacing(1),
      padding: theme.spacing(0.5),
    },
    itemSecondary: {
      backgroundColor: theme.palette.secondary.light,
      margin: theme.spacing(1),
      padding: theme.spacing(0.5),
    },
  });
}

export interface AllPrereqTaskListProps extends WithStyles<typeof styles> {
  isMainList?: boolean;
  prereqsList: string[];
  handlePrereqTaskChange: (e: MouseEvent<HTMLElement>) => void;
}

/**
 * Displays the prerequisite tasks as a list of buttons.
 * @param {PrereqTaskListProps} props PrereqTaskList properties.
 */
const AllPrereqTaskList = (props: AllPrereqTaskListProps): JSX.Element => {
  const { classes, isMainList, prereqsList, handlePrereqTaskChange } = props;

  const tasks = UserData.getTasks();
  const projects = UserData.getProjects();

  const taskDisp = prereqsList.filter(t => tasks[t] !== undefined);
  const projectDisp = prereqsList.filter(p => projects[p] !== undefined);

  return (
    <Grid item>
      <Typography>Projects</Typography>
      <List dense component="div" role="list">
        {projectDisp.length > 0 ? (
          <Paper>
            {projectDisp.map(p => {
              return (
                <Paper
                  className={
                    isMainList ? classes.itemPrimary : classes.itemSecondary
                  }
                >
                  <ListItem id={p} button onClick={handlePrereqTaskChange}>
                    <Typography>{projects[p]?.title}</Typography>
                  </ListItem>
                </Paper>
              );
            })}
          </Paper>
        ) : (
          <Typography align="center">None</Typography>
        )}
      </List>
      <Typography>Tasks</Typography>
      <List dense component="div" role="list">
        {taskDisp.length > 0 ? (
          <Paper
            className={isMainList ? classes.itemPrimary : classes.itemSecondary}
          >
            {taskDisp.map(t => {
              return (
                <ListItem id={t} button onClick={handlePrereqTaskChange}>
                  <Typography>{tasks[t]?.title}</Typography>
                </ListItem>
              );
            })}
          </Paper>
        ) : (
          <Typography align="center">None</Typography>
        )}
      </List>
    </Grid>
  );

  // return (
  //   <Grid item>
  //     <Typography>Tasks</Typography>
  //     {prereqsList.map(t => {
  //       return (
  //         <List dense component="div" role="list" key={`prereq-task-list-${t}`}>
  //           <Paper
  //             className={
  //               isMainList ? classes.itemPrimary : classes.itemSecondary
  //             }
  //           >
  //             {tasks[t] ? (
  //               <ListItem id={t} button onClick={handlePrereqTaskChange}>
  //                 <Typography>{tasks[t]?.title}</Typography>
  //               </ListItem>
  //             ) : (
  //               <></>
  //             )}
  //           </Paper>
  //         </List>
  //       );
  //     })}
  //     <Typography>Projects</Typography>
  //     {prereqsList.map(t => {
  //       return (
  //         <List dense component="div" role="list" key={`prereq-task-list-${t}`}>
  //           <Paper
  //             className={
  //               isMainList ? classes.itemPrimary : classes.itemSecondary
  //             }
  //           >
  //             {projects[t] ? (
  //               <ListItem id={t} button onClick={handlePrereqTaskChange}>
  //                 <Typography>{projects[t].title}</Typography>
  //               </ListItem>
  //             ) : (
  //               ''
  //             )}
  //           </Paper>
  //         </List>
  //       );
  //     })}
  //   </Grid>
  // );
};

export default withStyles(styles, { withTheme: true })(AllPrereqTaskList);
