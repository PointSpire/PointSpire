import React from 'react';
import {
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Typography,
  Theme,
  createStyles,
  WithStyles,
  withStyles,
  ListItemIcon,
} from '@material-ui/core';
import {
  Clear as RemIcon,
  CheckBox as CompletedIcon,
  CheckBoxOutlineBlank as NotCompIcon,
} from '@material-ui/icons';
import Task from '../../../../models/Task';

function styles(theme: Theme) {
  return createStyles({
    root: {
      margin: theme.spacing(0.8),
    },
    boxChecked: {
      color: theme.palette.primary.main,
    },
  });
}

export interface PrereqListProps extends WithStyles<typeof styles> {
  prereqType: 'project' | 'task';
  prereqs: Task[];
  handleRemove: (prereqId: string) => void;
}

/**
 * Builds the list of current prerequisites.
 * @param {PrereqListProps} props Properties.
 */
const PrereqList = (props: PrereqListProps): JSX.Element => {
  const { classes, prereqType, prereqs, handleRemove } = props;
  const title = prereqType === 'task' ? 'Tasks' : 'Projects';
  return (
    <Paper className={classes.root}>
      <Typography align="center">{title}</Typography>
      <List dense>
        {prereqs && prereqs.length > 0 ? (
          prereqs.map(item => (
            <ListItem key={`project-prereq-${item._id}`}>
              <ListItemIcon>
                {item.completed ? (
                  <CompletedIcon className={classes.boxChecked} />
                ) : (
                  <NotCompIcon />
                )}
              </ListItemIcon>
              <ListItemText primary={item.title} />
              <ListItemSecondaryAction>
                <IconButton onClick={() => handleRemove(item._id)} edge="end">
                  <RemIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))
        ) : (
          <Typography>{`No ${title}`}</Typography>
        )}
      </List>
    </Paper>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqList);
