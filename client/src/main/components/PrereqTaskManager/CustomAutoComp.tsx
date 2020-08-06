import React, { useState, MouseEvent, ChangeEvent } from 'react';
import {
  Paper,
  Typography,
  withStyles,
  WithStyles,
  Theme,
  createStyles,
  Popover,
  Button,
  IconButton,
  TextField,
  // List,
  // ListItem,
} from '@material-ui/core';
import AutoComplete, {
  AutocompleteCloseReason,
} from '@material-ui/lab/Autocomplete';
import RemIcon from '@material-ui/icons/Clear';
import UserData from '../../clientData/UserData';

function styles(theme: Theme) {
  return createStyles({
    popperBase: {
      // zIndex: 1000,
    },
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
    },
    autoCompFocused: {
      minHeight: '6em',
    },
  });
}

export interface CustomAutoCompProps extends WithStyles<typeof styles> {
  prereqs: string[];
}

interface OptionType {
  type: 'project' | 'task';
  title: string;
  _id: string;
}

const CustomAutoComp = (props: CustomAutoCompProps): JSX.Element => {
  const { prereqs, classes } = props;
  const allTasks = UserData.getTasks();
  const allProjects = UserData.getProjects();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [openPopper, setOpen] = useState<boolean>(false);
  const [currentPrereqs, setPrereqs] = useState<string[]>(prereqs);

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    setOpen(!openPopper);
    if (!openPopper) {
      setAnchor(e.currentTarget);
    } else {
      setAnchor(null);
    }
  };

  const handleClose = (
    _e: ChangeEvent<{}>,
    reason: AutocompleteCloseReason
  ) => {
    // Combine checks
    console.log(reason);
    if (reason === 'blur' || reason === 'escape') {
      setOpen(false);
      setAnchor(null);
    }
  };

  const handleAutoCompleteChange = (
    _e: ChangeEvent<{}>,
    selected: OptionType[]
  ) => {
    if (selected.length !== currentPrereqs.length) {
      setPrereqs(selected.map(sel => sel._id));
    }
  };

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

  return (
    <div>
      <Paper>
        <Button
          variant="outlined"
          className={classes.prereqPopBase}
          onClick={handleOpen}
        >
          Prereqs
        </Button>
        <div>
          {currentPrereqs && currentPrereqs.length > 0 ? (
            <div>
              <Typography align="center">Projects</Typography>
              <Paper>
                {Object.values(allProjects)
                  .filter(project => currentPrereqs.includes(project._id))
                  .map(project => (
                    <Paper key={`proj-prereq-${project._id}`}>
                      <Typography className={classes.valueItemTitle}>
                        {project.title}
                      </Typography>
                      <IconButton
                        className={classes.valueItemIcon}
                        size="small"
                      >
                        <RemIcon />
                      </IconButton>
                    </Paper>
                  ))}
              </Paper>
              <Typography align="center">Tasks</Typography>
              <Paper>
                {Object.values(allTasks)
                  .filter(task => currentPrereqs.includes(task._id))
                  .map(task => (
                    <Paper key={`task-prereq-${task._id}`}>
                      <Typography>{task.title}</Typography>
                    </Paper>
                  ))}
              </Paper>
            </div>
          ) : (
            <Typography>No Prerequisites</Typography>
          )}
        </div>
      </Paper>
      <Popover
        open={openPopper}
        anchorEl={anchor}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        transformOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
        className={classes.popperBase}
        onClose={handleOpen}
      >
        <Paper>
          <AutoComplete
            className={classes.autoCompBase}
            classes={{
              popper: classes.autoCompPopperRoot,
              focused: classes.autoCompFocused,
            }}
            open
            multiple
            disableCloseOnSelect
            clearOnBlur={false}
            options={options}
            popupIcon={null}
            onClose={handleClose}
            value={options.filter(completable =>
              currentPrereqs.includes(completable._id)
            )}
            getOptionLabel={option => option.title}
            groupBy={option => (option.type === 'project' ? 'Project' : 'Task')}
            renderOption={option => (
              <Typography id={option._id}>{option.title}</Typography>
            )}
            // eslint-disable-next-line react/jsx-props-no-spreading
            renderInput={params => <TextField {...params} label="Search" />}
            renderTags={() => null}
            onChange={handleAutoCompleteChange}
          />
        </Paper>
      </Popover>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(CustomAutoComp);
