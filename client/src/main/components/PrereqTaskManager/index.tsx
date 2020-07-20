import React, { useState, MouseEvent, KeyboardEvent, ChangeEvent } from 'react';
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
  MenuItem,
  Select,
} from '@material-ui/core';
import { Search as SearchIcon, Clear as ClearIcon } from '@material-ui/icons';
import { Task, CompletableType } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';
import PrereqTaskList from './PrereqTaskList';
import PrereqProjectTaskList from './PrereqProjectTaskList';
import AllPrereqTasks from './AllPrereqTasks';

function searchByNameDescending(searchTerm: string, tasks: Task[]): string[] {
  const matches = tasks.filter(task =>
    task.title.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return matches.map(task => task._id);
}

function styles(theme: Theme) {
  return createStyles({
    gridItem: {
      padding: theme.spacing(1),
    },
    areaPaper: {
      padding: theme.spacing(1),
      backgroundColor: theme.palette.background.paper,
    },
    paperList: {
      padding: theme.spacing(2.3),
      borderColor: theme.palette.primary.dark,
      borderWidth: '4px',
    },
    paperSearchBar: {
      backgroundColor: theme.palette.primary.light,
    },
    saveButton: {
      backgroundColor: theme.palette.primary.light,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    cancelButton: {
      backgroundColor: theme.palette.warning.light,
      '&:hover': {
        backgroundColor: theme.palette.warning.dark,
      },
    },
    searchButtonBase: {
      color: theme.palette.secondary.main,
      alignItems: 'center',
      width: '30px',
      height: '30px',
    },
    dividerBase: {
      margin: theme.spacing(0.5),
    },
  });
}

export interface PrereqTaskManagerProps extends WithStyles<typeof styles> {
  savePrereqId: string;
  completableId: string;
  completableType: CompletableType;
  closeDialog: (
    e: MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
}

interface Selection {
  name?: string | undefined;
  value: unknown;
}

/**
 * Controlls the display and selection of prerequisite tasks.
 * Now that it works, im goin to work on gettin the code cleaned
 * up and more efficient.
 */
const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  const {
    classes,
    completableId,
    completableType,
    savePrereqId,
    closeDialog,
  } = props;
  const completable = UserData.getCompletable(completableType, completableId);
  const allTasks = UserData.getTasks();
  const [currentPrereqTasks, setCurrentPrereqTasks] = useState<string[]>(
    completable.prereqTasks
  );
  const [selectedFilter, setFilter] = useState<string>('Projects');
  const [searchText, setSearchText] = useState<string>('');
  const [searchOn, setSearch] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<string[]>([]);

  /**
   * Selected ids to display from allTasks.
   */
  const allTaskIds = searchOn ? searchResults : Object.keys(allTasks);

  /**
   * finds the task selected and either removes or adds it to the
   * prereqTask state.
   * When a task is clicked in the Prereq menu, the selected task is sent
   * to this function.
   * @param {MouseEvent<HTMLElement>} e Task selected by the user.
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

  /**
   * triggeres the search if the enter key is pressed.
   * @param {KeyboardEvent<HTMLInputElement>} e Key press event args.
   */
  const handleKeyDownEvent = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearchPrereqClick();
    }
  };

  const handleSelectEvent = (e: ChangeEvent<Selection>) => {
    const { value } = e.target;
    if (value !== undefined) {
      setFilter(value as string);
    }
  };

  const generateMainTaskList = () => {
    if (allTasks) {
      if (selectedFilter === 'Projects') {
        return (
          <PrereqProjectTaskList
            handlePrereqTaskChange={handlePrereqTasksChange}
          />
        );
      }
      return (
        <PrereqTaskList
          taskList={allTaskIds}
          handlePrereqTaskChange={handlePrereqTasksChange}
        />
      );
    }
    return <Typography>You have nothing to do! Wow.</Typography>;
  };

  return (
    <Grid container direction="row">
      <Grid item xs={4} className={classes.gridItem}>
        <Paper className={classes.areaPaper}>
          <Typography align="center">{`Task: ${completable.title}`}</Typography>
          <Select value={selectedFilter} onChange={handleSelectEvent}>
            <MenuItem value="Projects">Projects</MenuItem>
            <MenuItem value="Tasks">Tasks</MenuItem>
          </Select>
          {generateMainTaskList()}
        </Paper>
      </Grid>
      <Grid item xs={4} className={classes.gridItem}>
        <Paper>
          <Paper className={classes.paperSearchBar}>
            <Grid
              container
              direction="row"
              alignItems="stretch"
              justify="space-between"
            >
              <Grid item xs={searchOn ? 6 : 8}>
                <InputBase
                  placeholder="Search Tasks"
                  value={searchText}
                  onKeyDown={handleKeyDownEvent}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchText(e.target.value);
                  }}
                />
              </Grid>
              {searchOn || searchText.length > 0 ? (
                <Grid item xs={2}>
                  <IconButton
                    className={classes.searchButtonBase}
                    onClick={() => {
                      setSearchText('');
                      handleSearchClear();
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Grid>
              ) : (
                ''
              )}
              <Grid item xs={2}>
                <IconButton
                  onClick={handleSearchPrereqClick}
                  className={classes.searchButtonBase}
                >
                  <SearchIcon />
                </IconButton>
              </Grid>
            </Grid>
          </Paper>
          <Divider orientation="horizontal" className={classes.dividerBase} />
          <Typography>Filters</Typography>
          <Divider orientation="horizontal" />
          <Button
            variant="text"
            fullWidth
            onClick={() => setCurrentPrereqTasks(allTaskIds)}
          >
            Add All
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => setCurrentPrereqTasks([])}
          >
            Remove All
          </Button>
        </Paper>
      </Grid>
      <Grid item xs={4} className={classes.gridItem}>
        <Paper className={classes.areaPaper}>
          <Typography align="center">Prerequisites</Typography>
          {currentPrereqTasks && currentPrereqTasks.length > 0 ? (
            <AllPrereqTasks
              handlePrereqTaskChange={handlePrereqTasksChange}
              prereqsList={currentPrereqTasks}
            />
          ) : (
            <Typography align="center">No Prerequisite Tasks</Typography>
          )}
        </Paper>
      </Grid>
      <Grid
        container
        direction="row-reverse"
        className={classes.gridItem}
        alignItems="flex-start"
      >
        <Grid item>
          <Button
            className={classes.saveButton}
            id={savePrereqId}
            variant="text"
            onClick={e => closeDialog(e, currentPrereqTasks)}
          >
            Save
          </Button>
        </Grid>
        <Grid item>
          <Button
            className={classes.cancelButton}
            variant="text"
            onClick={e => closeDialog(e, null)}
          >
            Cancel
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqTaskManager);
