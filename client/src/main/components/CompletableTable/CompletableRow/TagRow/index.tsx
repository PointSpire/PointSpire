import React, { useEffect, useState } from 'react';
import {
  WithStyles,
  createStyles,
  withStyles,
  TextField,
  colors,
} from '@material-ui/core';
import { ObjectID } from 'bson';
import { Autocomplete } from '@material-ui/lab';
import { CompletableType, UserTags } from '../../../../utils/dbTypes';
import TagChip from './TagChip';
import Completables from '../../../../models/Completables';
import User from '../../../../models/User';

function styles() {
  return createStyles({
    root: {
      display: 'flex',
      width: '100%',
      justifyContent: 'flex-start',
      flexWrap: 'wrap',
    },
  });
}

export interface TagRowProps extends WithStyles<typeof styles> {
  completableType: CompletableType;
  completableId: string;
}

function TagRow(props: TagRowProps) {
  const { classes, completableId, completableType } = props;

  const [tags, setTags] = useState<Array<string>>(
    Completables.get(completableType, completableId).tags
      ? Completables.get(completableType, completableId).tags
      : []
  );

  const [userTags, setUserTags] = useState(User.get().currentTags);

  const listenerId = `${completableId}.TagRow`;

  // Subscribe to changes in the tags of the completable
  useEffect(() => {
    Completables.addPropertyListener(
      completableType,
      completableId,
      listenerId,
      'tags',
      updatedTags => {
        setTags(updatedTags as string[]);
      }
    );

    return () => {
      Completables.removePropertyListener(
        completableType,
        completableId,
        listenerId,
        'tags'
      );
    };
  });

  // Subscribe to changes in the user's tags
  useEffect(() => {
    User.addPropertyListener(listenerId, 'currentTags', updatedUserTags => {
      setUserTags({ ...(updatedUserTags as UserTags) });
    });

    return () => {
      User.removePropertyListener('currentTags', listenerId);
    };
  }, []);

  /**
   * Adds the tag to the user tags and to the completable if the tag is new.
   *
   * @param {string} newTagName
   */
  function addTag(newTagName: string) {
    // Check if the tag already exists
    let tagId: string;
    const userTagIds = Object.keys(userTags);
    const tagIndex = userTagIds.findIndex(userTagId => {
      return userTags[userTagId].name === newTagName;
    });

    // If the tag doesn't exist, then add it to user tags
    if (tagIndex === -1) {
      // eslint-disable-next-line
      console.log('A new tag was added that wasnt in the user object');

      // Create the new tag ID
      tagId = new ObjectID().toString();

      // Save the new tag
      userTags[tagId] = {
        color: colors.yellow[700],
        name: newTagName,
      };
      User.setAndSaveProperty('currentTags', userTags);
    } else {
      // The tag does exist, so set it's ID
      tagId = userTagIds[tagIndex];
    }

    // Save the new tag to the completable
    tags.push(tagId);
    Completables.setAndSaveProperty(completableType, completableId, 'tags', [
      ...tags,
    ]);
  }

  function getTagNamesOnCompletable(): string[] {
    return tags.map(tagId => {
      if (userTags[tagId]) {
        return userTags[tagId].name;
      }
      return '';
    });
  }

  function getTagIdsFromTagNames(tagNames: string[]): string[] {
    const tagIds: string[] = [];
    Object.entries(userTags).forEach(([tagId, userTag]) => {
      if (tagNames.includes(userTag.name)) {
        tagIds.push(tagId);
      }
    });
    return tagIds;
  }

  function handleValueChange(
    _event: React.ChangeEvent<{}>,
    tagNames: string[]
  ) {
    const tagNamesOnCompletable = getTagNamesOnCompletable();

    // Filter out the newTagNames to see if there are any new tags added.
    const newTagNames = tagNames.filter(tagName => {
      return !tagNamesOnCompletable.includes(tagName);
    });

    // If there is a new tag, then add it
    if (newTagNames.length > 0) {
      addTag(newTagNames[0]);
    } else {
      // There isn't a new tag name, so update the completable directly
      const updatedTags = getTagIdsFromTagNames(tagNames);
      Completables.setAndSaveProperty(
        completableType,
        completableId,
        'tags',
        updatedTags
      );
    }
  }

  function getTagIdFromName(tagName: string): string {
    let tagId = '';
    Object.entries(userTags).find(([userTagId, userTag]) => {
      if (userTag.name === tagName) {
        tagId = userTagId;
        return true;
      }
      return false;
    });
    return tagId;
  }

  return (
    <div className={classes.root}>
      <Autocomplete
        className={classes.root}
        multiple
        value={getTagNamesOnCompletable()}
        options={Object.values(userTags).map(userTag => userTag.name)}
        size="small"
        freeSolo
        renderTags={(tagNames, getTagProps) => {
          return tagNames.map((tagName, index) => {
            const tagId = getTagIdFromName(tagName);
            return (
              <TagChip
                key={tagId}
                userTag={userTags[tagId]}
                getTagProps={getTagProps}
                index={index}
              />
            );
          });
        }}
        onChange={handleValueChange}
        autoHighlight
        filterSelectedOptions
        getOptionLabel={option => option}
        renderInput={params => (
          <TextField
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...params}
            variant="standard"
            label="Tags"
            placeholder="Add Tag"
          />
        )}
      />
    </div>
  );
}

export default withStyles(styles)(TagRow);
