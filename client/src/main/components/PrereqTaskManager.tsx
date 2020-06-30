import React, { useState, MouseEvent } from 'react';
import {
  Grid,
  Divider,
  Typography,
  IconButton,
  InputBase,
  Paper,
  createStyles,
  withStyles,
  Theme,
  WithStyles,
  Button,
} from '@material-ui/core';
import { Search as SearchIcon, Clear as ClearIcon } from '@material-ui/icons';
import { Task, TaskObjects } from '../logic/dbTypes';
import PrereqTaskList from './PrereqTaskList';
import { searchByNameDescending } from '../logic/sortingFunctions';

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
  closeDialog: (
    e: MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
}

/**
 * Controlls the display and selection of prerequisite tasks.
 * Now that it works, im goin to work on gettin the code cleaned
 * up and more efficient.
 */
const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const { classes, parentTask, allTasks, closeDialog } = props;
  const [currentPrereqTasks, setCurrentPrereqTasks] = useState<string[]>(
    parentTask.prereqTasks
  );
  const [searchText, setSearchText] = useState<string>('');
  const [searchOn, setSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const allTaskIds = searchOn ? searchResults : Object.keys(allTasks);

  /**
   * finds the task selected and either removes or adds it to the
   * prereqTask state.
   * When a task is clicked in the Prereq menu, the selected task is sent
   * to this function.
   * @param {string} taskId Task selected by the user.
   */
  const handlePrereqTasksChange = (e: MouseEvent<HTMLElement>): void => {
    const { id: taskId } = e.currentTarget;
    if (currentPrereqTasks) {
      if (currentPrereqTasks.includes(taskId)) {
        setCurrentPrereqTasks(currentPrereqTasks.filter(id => id !== taskId));
      } else {
        const newPrereqs = [...currentPrereqTasks, taskId];
        setCurrentPrereqTasks(newPrereqs);
      }
    }
  };

  /**
   * Clears the search box, resets the diplayed tasks to ALL and hides the
   * clear search button.
   */
  const handleSearchClear = () => {
    setSearch(false);
  };

  /**
   * Gets all tasks, gets the IDs and sends it to the sortingFunctions file.
   * @param searchTerm The search string entered into the prereq search box.
   */
  const handleSearchPrereqClick = (): void => {
    const allTaskValues = Object.values(allTasks);
    setSearchResults(searchByNameDescending(searchText, allTaskValues));
    setSearch(true);
  };

  const handleKeyDownEvent = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchPrereqClick();
    }
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
              {searchOn || searchText.length > 0 ? (
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
              <IconButton onClick={handleSearchPrereqClick}>
                <SearchIcon />
              </IconButton>
            </Paper>
          </Paper>
        </Grid>
        {allTasks ? (
          <PrereqTaskList
            taskList={allTaskIds}
            tasks={allTasks}
            handlePrereqTaskChange={handlePrereqTasksChange}
          />
        ) : (
          <Typography>You have nothing to do! Wow.</Typography>
        )}
        <Divider orientation="horizontal" />
        <Typography align="center">Current Prerequisite Tasks</Typography>
        {currentPrereqTasks && currentPrereqTasks.length > 0 ? (
          <PrereqTaskList
            taskList={currentPrereqTasks}
            tasks={allTasks}
            handlePrereqTaskChange={handlePrereqTasksChange}
          />
        ) : (
          <Typography align="center">No Prerequisite Tasks</Typography>
        )}
      </Grid>
      <Button
        id="cancel-prereq-tasks"
        variant="text"
        onClick={e => closeDialog(e, null)}
      >
        Cancel
      </Button>
      <Button
        id="save-prereq-tasks"
        variant="text"
        onClick={e => closeDialog(e, currentPrereqTasks)}
      >
        Save
      </Button>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskManager);
