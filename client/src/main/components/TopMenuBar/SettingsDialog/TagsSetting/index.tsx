import React, { useState, useEffect } from 'react';
import {
  Typography,
  createStyles,
  withStyles,
  WithStyles,
  Theme,
} from '@material-ui/core';
import { UserTags } from '../../../../utils/dbTypes';
import SettingsTagChip from './SettingsTagChip';
import User from '../../../../models/User';

function styles(theme: Theme) {
  return createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
      flexWrap: 'wrap',
    },
    tagChips: {
      display: 'flex',
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    tag: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
    },
  });
}

export type TagsSettingProps = WithStyles<typeof styles>;

/**
 * Represents the setting for the font size. This handles validation on the
 * input.
 *
 * @param {TagsSettingProps} props the props
 */
function TagsSetting(props: TagsSettingProps): JSX.Element {
  const { classes } = props;

  const [userTags, setUserTags] = useState(User.get().currentTags);

  const listenerId = `TagsSetting`;

  /**
   * Subscribe to changes in the user tags
   */
  useEffect(() => {
    User.addPropertyListener(listenerId, 'currentTags', updatedUserTags => {
      setUserTags(updatedUserTags as UserTags);
    });

    return () => {
      User.removePropertyListener('currentTags', listenerId);
    };
  });

  /**
   * Creates a delete function that can be used to remove a user's tag.
   *
   * @param {string} tagId the ID of the tag
   */
  function createDeleteFunction(tagId: string) {
    return () => {
      User.removeTagAndSave(tagId);
    };
  }

  return (
    <div className={classes.root}>
      <Typography variant="body1">Tags</Typography>
      <div className={classes.tagChips}>
        {Object.entries(userTags).map(([tagId, userTag]) => (
          <SettingsTagChip
            userTagId={tagId}
            key={tagId}
            deleteTag={createDeleteFunction(tagId)}
            className={classes.tag}
            userTag={userTag}
          />
        ))}
      </div>
    </div>
  );
}

export default withStyles(styles, { withTheme: true })(TagsSetting);
