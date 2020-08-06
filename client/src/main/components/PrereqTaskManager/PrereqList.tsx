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
} from '@material-ui/core';
import RemIcon from '@material-ui/icons/Clear';
import { Task } from '../../utils/dbTypes';

function styles(theme: Theme) {
  return createStyles({
    root: {
      margin: theme.spacing(0.8),
    },
  });
}

export interface PrereqListProps extends WithStyles<typeof styles> {
  prereqType: 'project' | 'task';
  prereqs: Task[];
  handleRemove: (prereqId: string) => void;
}

const PrereqList = (props: PrereqListProps) => {
  const { classes, prereqType, prereqs, handleRemove } = props;
  const title = prereqType === 'task' ? 'Tasks' : 'Projects';
  return (
    <Paper className={classes.root}>
      <Typography align="center">{title}</Typography>
      <List dense>
        {prereqs && prereqs.length > 0 ? (
          prereqs.map(item => (
            <ListItem key={`project-prereq-${item._id}`}>
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
