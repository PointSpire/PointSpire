import React from 'react';
import {
  Card,
  createStyles,
  Theme,
  withStyles,
  Paper,
  Typography,
} from '@material-ui/core';
import UserData from '../../clientData/UserData';

function styles(theme: Theme) {
  return createStyles({
    item: {
      backgroundColor: theme.palette.primary.main,
    },
  });
}

export interface PrereqSearchDisplayProps {
  searchTasks: string[];
}

const PrereqSearchDisplay = (props: PrereqSearchDisplayProps) => {
  const { searchTasks } = props;
  const allTasks = UserData.getTasks();
  return (
    <Card>
      {searchTasks.map(task => (
        <Paper>
          <Typography>{allTasks[task].title}</Typography>
        </Paper>
      ))}
    </Card>
  );
};

export default withStyles(styles, { withTheme: true })(PrereqSearchDisplay);
