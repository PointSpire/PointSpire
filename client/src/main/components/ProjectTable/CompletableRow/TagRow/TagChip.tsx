import React from 'react';
import { Chip, ThemeProvider, createMuiTheme, colors } from '@material-ui/core';
import { UserTag } from '../../../../utils/dbTypes';

export interface TagChipProps {
  userTag: UserTag;
  index: number;
  getTagProps: ({ index }: { index: number }) => {};
}

function TagChip(props: TagChipProps) {
  const { userTag, index, getTagProps } = props;

  /**
   * Automatically creates the theme with contrasting text based on the color.
   */
  const theme = createMuiTheme({
    palette: {
      primary: {
        main: userTag && userTag.color ? userTag.color : colors.yellow[700],
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Chip
        label={userTag && userTag.name ? userTag.name : 'Undefined'}
        size="small"
        color="primary"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...getTagProps({ index })}
      />
    </ThemeProvider>
  );
}

export default TagChip;
