import React, { useState, ChangeEvent } from 'react';
import {
  Grid,
  Divider,
  Typography,
  createStyles,
  withStyles,
  Theme,
  WithStyles,
  Button,
  Paper,
  TextField,
} from '@material-ui/core';
import AutoComplete, {
  AutocompleteCloseReason,
} from '@material-ui/lab/Autocomplete';
import UserData from '../../clientData/UserData';
import PrereqList from './PrereqList';

// #region [ rgba(0,100,200,0.05) ] External functions and sytle function
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
    saveButton: {
      backgroundColor: theme.palette.primary.light,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
      },
    },
    cancelButton: {
      backgroundColor: theme.palette.secondary.light,
      '&:hover': {
        backgroundColor: theme.palette.secondary.dark,
      },
    },
    dividerBase: {
      margin: theme.spacing(0.5),
    },
    prereqPaper: {
      margin: theme.spacing(1),
    },
    // #region New CSS classes
    prereqPopBase: {
      width: '100%',
    },
    autoCompBase: {
      minWidth: '200px',
      maxWidth: '400px',
    },
    valueItemTitle: {
      display: 'inline',
    },
    selectedList: {
      maxHeight: '100px',
    },
    valueItemIcon: {
      display: 'inline',
      alignItems: 'left',
      '&:hover': {
        backgroundColor: theme.palette.secondary.light,
      },
    },
    autoCompInput: {
      backgroundColor: 'red',
    },
    autoCompPopperRoot: {
      backgroundColor: theme.palette.primary.main,
      position: 'absolute',
      top: 0,
    },
    autoCompFocused: {
      backgroundColor: theme.palette.background.paper,
    },
    // #endregion
  });
}
// #endregion

// #region [ rgba(200,100,0,0.05) ] Interfaces
export interface PrereqTaskManagerProps extends WithStyles<typeof styles> {
  currentPrereqs: string[];
  updatePrereqs: (newPrereqs: string[]) => void;
}

interface OptionType {
  type: 'task' | 'project';
  title: string;
  _id: string;
}
// #endregion

/**
 * Controlls the display and selection of prerequisite tasks.
 * Now that it works, im goin to work on gettin the code cleaned
 * up and more efficient.
 */
const PrereqTaskManager = (props: PrereqTaskManagerProps): JSX.Element => {
  // #region [ rgba(100, 180, 0, 0.05) ] Property Def
  const { classes, currentPrereqs, updatePrereqs } = props;
  const allTasks = UserData.getTasks();
  const allProjects = UserData.getProjects();
  const [openPopper, setOpen] = useState<boolean>(false);

  const prereqProjects = Object.values(allProjects).filter(project =>
    currentPrereqs.includes(project._id)
  );
  const prereqTasks = Object.values(allTasks).filter(task =>
    currentPrereqs.includes(task._id)
  );

  /**
   * Used by the AutoComplete component to display and
   * track the selections made by the user.
   */
  const options = [
    ...Object.values(allTasks).map(task => {
      return {
        type: 'task',
        title: task.title,
        _id: task._id,
      };
    }),
    ...Object.values(allProjects).map(project => {
      return {
        type: 'project',
        title: project.title,
        _id: project._id,
      };
    }),
  ] as OptionType[];
  // #endregion

  // #region [ rgba(200, 0, 180, 0.05) ] Component Methods
  const handleAutoCompleteChange = (
    _e: ChangeEvent<{}>,
    selected: OptionType[]
  ) => {
    if (selected.length !== currentPrereqs.length) {
      updatePrereqs(selected.map(sel => sel._id));
    }
  };

  const handleAutoCompleteClose = (
    _e: ChangeEvent<{}>,
    reason: AutocompleteCloseReason
  ) => {
    if (reason === 'blur' || reason === 'escape') {
      setOpen(false);
    }
  };

  /**
   * Removes the completable ID from the currentPrereqs when the 'X' button is
   * pressed next to the completable title.
   * @param {string} itemId Id of the Completable.
   */
  const handleItemRemove = (itemId: string) => {
    const tempPrereqs = currentPrereqs.filter(item => itemId !== item);
    updatePrereqs(tempPrereqs);
  };

  /**
   * Adds all the completable IDs to the currentPrereqs.
   */
  const handleAddAllTaskObjects = () => {
    updatePrereqs([...Object.keys(allTasks), ...Object.keys(allProjects)]);
  };
  // #endregion

  // #region [ rgba(200,50,50,0.1) ] JSX
  // I wish there was a way to have regions in JSX.
  return (
    <Grid container direction="column">
      <Grid item>
        <Paper>
          <AutoComplete
            className={classes.autoCompBase}
            classes={{
              popper: classes.autoCompPopperRoot,
              root: classes.autoCompFocused,
            }}
            open={openPopper}
            multiple
            fullWidth
            clearOnBlur={false}
            options={options}
            popupIcon={null}
            onClose={handleAutoCompleteClose}
            onOpen={() => setOpen(true)}
            value={options.filter(compl => currentPrereqs.includes(compl._id))}
            getOptionLabel={option => option.title}
            groupBy={
              option => (option.type === 'project' ? 'Project' : 'Task')
              // eslint-disable-next-line react/jsx-curly-newline
            }
            renderOption={option => (
              <Typography id={option._id}>{option.title}</Typography>
            )}
            // eslint-disable-next-line react/jsx-props-no-spreading
            renderInput={params => <TextField {...params} label="Search" />}
            renderTags={() => null}
            onChange={handleAutoCompleteChange}
          />
          {currentPrereqs && currentPrereqs.length > 0 ? (
            <Paper className={classes.areaPaper}>
              <PrereqList
                prereqType="project"
                prereqs={prereqProjects}
                handleRemove={handleItemRemove}
              />
              <PrereqList
                prereqType="task"
                prereqs={prereqTasks}
                handleRemove={handleItemRemove}
              />
            </Paper>
          ) : (
            <Typography>No Prerequisites</Typography>
          )}
        </Paper>
      </Grid>
      <Divider orientation="horizontal" className={classes.dividerBase} />
      <Grid container direction="row" justify="space-evenly">
        <Button variant="text" onClick={handleAddAllTaskObjects}>
          Add All
        </Button>
        <Button variant="text" onClick={() => updatePrereqs([])}>
          Remove All
        </Button>
      </Grid>
    </Grid>
  );
  // #endregion
};

export default withStyles(styles, { withTheme: true })(PrereqTaskManager);
