import React, { useState, MouseEvent, ChangeEvent } from 'react';
import {
  Grid,
  Divider,
  Typography,
  createStyles,
  withStyles,
  Theme,
  WithStyles,
  Button,
  TextField,
} from '@material-ui/core';
import { Autocomplete } from '@material-ui/lab';
import { CompletableType } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';

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
    autoCompBase: {
      minWidth: theme.spacing(10),
      maxWidth: theme.spacing(50),
    },
  });
}
// #endregion

// #region [ rgba(200,100,0,0.05) ] Interfaces
export interface PrereqTaskManagerProps extends WithStyles<typeof styles> {
  savePrereqId: string;
  completableId: string;
  completableType: CompletableType;
  closeDialog: (
    e: MouseEvent<HTMLElement>,
    prereqTasks: string[] | null
  ) => void;
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
  const {
    classes,
    completableId,
    completableType,
    savePrereqId,
    closeDialog,
  } = props;
  const completable = UserData.getCompletable(completableType, completableId);
  const allTasks = UserData.getTasks();
  const allProjects = UserData.getProjects();
  const [currentPrereqTasks, setCurrentPrereqTasks] = useState<string[]>(
    completable.prereqTasks
  );

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
    if (selected.length !== currentPrereqTasks.length) {
      setCurrentPrereqTasks(selected.map(sel => sel._id));
    }
  };

  const handleAddAllTaskObjects = () => {
    setCurrentPrereqTasks([
      ...Object.keys(allTasks),
      ...Object.keys(allProjects),
    ]);
  };
  // #endregion

  // #region [ rgba(200,50,50,0.1) ] JSX
  // I wish there was a way to have regions in JSX.
  return (
    <Grid container direction="column">
      <Grid item>
        <Autocomplete
          className={classes.autoCompBase}
          disableCloseOnSelect
          options={options}
          value={options.filter(compl =>
            currentPrereqTasks.includes(compl._id)
          )}
          multiple
          getOptionLabel={option => option.title}
          groupBy={option => (option.type === 'task' ? 'Task' : 'Project')}
          renderOption={option => (
            <Typography id={option._id}>{option.title}</Typography>
          )}
          // eslint-disable-next-line react/jsx-props-no-spreading
          renderInput={params => <TextField {...params} label="Search" />}
          onChange={handleAutoCompleteChange}
        />
      </Grid>
      <Divider orientation="horizontal" className={classes.dividerBase} />
      <Grid container direction="row">
        <Button variant="text" onClick={handleAddAllTaskObjects}>
          Add All
        </Button>
        <Button variant="text" onClick={() => setCurrentPrereqTasks([])}>
          Remove All
        </Button>
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
  // #endregion
};

export default withStyles(styles, { withTheme: true })(PrereqTaskManager);
