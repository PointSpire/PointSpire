import React, { useState } from 'react';
import {
  Grid,
  Divider,
  Typography,
  IconButton,
  InputBase,
  Paper,
  List,
  ListItem,
  createStyles,
  withStyles,
  Theme,
  WithStyles,
} from '@material-ui/core';
import { Search as SearchIcon, Clear as ClearIcon } from '@material-ui/icons';
import { Task, TaskObjects } from '../logic/dbTypes';

function styles(theme: Theme) {
  return createStyles({
    root: {
      backgroundColor: theme.palette.background.default,
    },
    paperList: {
      padding: theme.spacing(2.3),
      borderColor: theme.palette.primary.dark,
      borderWidth: '4px',
    },
    paperSearchBar: {
      backgroundColor: theme.palette.primary.light,
    },
  });
}

export interface PrereqTaskManagerProps extends WithStyles<typeof styles> {
  parentTask: Task;
  allTasks: TaskObjects;
  prereqTasks: string[];
  searchTaskResults: string[];
  isSearch: boolean;
  handlePrereqTaskChange: (taskId: string) => void;
  handleSearchClick: (searchTerm: string) => void;
  handleSearchClear: () => void;
}

/**
 * Controlls the display and selection of prerequisite tasks.
 * Now that it works, im goin to work on gettin the code cleaned
 * up and more efficient.
 */
const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const {
    classes,
    parentTask,
    allTasks,
    prereqTasks,
    searchTaskResults,
    isSearch,
    handlePrereqTaskChange,
    handleSearchClick,
    handleSearchClear,
  } = props;
  const [searchText, setSearchText] = useState<string>('');
  const allTaskIds = isSearch ? searchTaskResults : Object.keys(allTasks);

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchClick(searchText);
    }
  };

  /**
   * Renderes the list of tasks given.
   * @param tasklist Array of task IDs
   * @param {boolean} isMain True: allTaskIds, False: prereqTasks
   */
  const generateTaskList = (tasklist: string[], isMain: boolean) => {
    return tasklist && tasklist.length > 0 ? (
      tasklist.map(t => {
        return (
          <Grid item key={`all-task-${t}`}>
            <List dense component="div" role="list">
              <Paper className={classes?.paperList}>
                {isMain ? (
                  <ListItem button onClick={() => handlePrereqTaskChange(t)}>
                    <Typography>{allTasks[t]?.title}</Typography>
                  </ListItem>
                ) : (
                  <ListItem button onClick={() => handlePrereqTaskChange(t)}>
                    <Typography>{allTasks[t]?.title}</Typography>
                  </ListItem>
                )}
              </Paper>
            </List>
          </Grid>
        );
      })
    ) : (
      <Grid item>
        <Typography>No Tasks found.</Typography>
      </Grid>
    );
  };

  return (
    <div className={classes.root}>
      <Grid container direction="column">
        <Grid item>
          <Paper>
            <Typography align="center">{`Current Task: ${parentTask.title}`}</Typography>
            <Paper className={classes.paperSearchBar}>
              <InputBase
                placeholder="Search Tasks"
                value={searchText}
                onKeyDown={handleKeyDownEvent}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchText(e.target.value);
                }}
              />
              {isSearch || searchText.length > 0 ? (
                <IconButton
                  onClick={() => {
                    setSearchText('');
                    handleSearchClear();
                  }}
                >
                  <ClearIcon />
                </IconButton>
              ) : (
                ''
              )}
              <IconButton onClick={() => handleSearchClick(searchText)}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Paper>
        </Grid>
        {allTasks ? (
          generateTaskList(allTaskIds, true)
        ) : (
          <Typography>You have nothing to do! Wow.</Typography>
        )}
        <Divider orientation="horizontal" />
        <Typography align="center">Current Prerequisite Tasks</Typography>
        {prereqTasks && prereqTasks.length > 0 ? (
          generateTaskList(prereqTasks, false)
        ) : (
          <Typography align="center">No Prerequisite Tasks</Typography>
        )}
      </Grid>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskManager);
