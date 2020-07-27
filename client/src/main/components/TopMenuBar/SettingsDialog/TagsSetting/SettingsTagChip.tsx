import React, { useState } from 'react';
import { Chip, ThemeProvider, createMuiTheme } from '@material-ui/core';
import { UserTag } from '../../../../utils/dbTypes';
import EditTagDialog from './EditTagDialog';

export interface SettingsTagChipProps {
  userTagId: string;
  userTag: UserTag;
  className: string;
  deleteTag: () => void;
}

function SettingsTagChip(props: SettingsTagChipProps) {
  const { userTag, className, deleteTag, userTagId } = props;

  const [dialogOpen, setDialogOpen] = useState(false);

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

  function handleClick() {
    setDialogOpen(true);
  }

  return (
    <>
      <ThemeProvider theme={theme}>
        <Chip
          label={userTag && userTag.name ? userTag.name : 'Undefined'}
          size="small"
          color="primary"
          className={className}
          onDelete={deleteTag}
          clickable
          onClick={handleClick}
        />
      </ThemeProvider>
      <EditTagDialog
        tagId={userTagId}
        userTag={userTag}
        setOpen={setDialogOpen}
        open={dialogOpen}
      />
    </>
  );
}

export default SettingsTagChip;
