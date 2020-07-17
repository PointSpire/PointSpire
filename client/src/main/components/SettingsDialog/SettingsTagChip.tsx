import React from 'react';
import { Chip, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { UserTag } from '../../utils/dbTypes';

export interface SettingsTagChipProps {
  userTag: UserTag;
  className: string;
  deleteTag: () => void;
}

function SettingsTagChip(props: SettingsTagChipProps) {
  const { userTag, className, deleteTag } = props;

  /**
   * Automatically creates the theme with contrasting text based on the color.
   */
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: userTag && userTag.color ? userTag.color : '#fff',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Chip
        label={userTag && userTag.name ? userTag.name : 'Undefined'}
        size="small"
        color="primary"
        className={className}
        onDelete={deleteTag}
      />
    </ThemeProvider>
  );
}

export default SettingsTagChip;
