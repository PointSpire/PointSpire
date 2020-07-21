import React, { useState } from 'react';
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
} from '@material-ui/core';
import { UserTag } from '../../../../utils/dbTypes';
import UserData from '../../../../clientData/UserData';
import colors, { createThemeFromColorName } from '../../../../utils/colors';

export interface EditTagDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  userTag: UserTag;
  tagId: string;
}

function EditTagDialog(props: EditTagDialogProps) {
  const { open, setOpen, userTag, tagId } = props;

  function getColorNameFromValue(colorValue: string): string {
    let foundColorName = '';
    Object.entries(colors).find(([colorName, colorValues]) => {
      if (Object.values(colorValues).includes(colorValue)) {
        foundColorName = colorName;
        return true;
      }
      return false;
    });
    return foundColorName;
  }

  const [tagName, setTagName] = useState(userTag.name);
  const [tagColorName, setTagColorName] = useState(
    getColorNameFromValue(userTag.color)
  );

  function saveTag() {
    const updatedTags = { ...UserData.getUser().currentTags };
    updatedTags[tagId].name = tagName;
    const colorValues = colors[tagColorName];
    // eslint-disable-next-line prefer-destructuring
    updatedTags[tagId].color = colorValues[700];
    UserData.setAndSaveUserProperty('currentTags', updatedTags);
  }

  function handleClose() {
    saveTag();
    setOpen(false);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTagName(event.target.value);
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Enter') {
      handleClose();
    }
  }

  function handleColorChange(event: React.ChangeEvent<{ value: unknown }>) {
    const colorName = event.target.value as string;
    setTagColorName(colorName);
  }

  function capitalizeFirstLetter(str: string): string {
    return str[0].toUpperCase() + str.slice(1);
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      scroll="paper"
      aria-labelledby="edit-tag-dialog-title"
      onKeyDown={handleKeyDown}
    >
      <DialogTitle id="edit-tag-dialog-title">
        {`Edit tag "${userTag.name}"`}
      </DialogTitle>
      <DialogContent>
        <TextField label="Tag Name" value={tagName} onChange={handleChange} />
        <br />
        <Select
          label="Tag Color"
          value={tagColorName}
          onChange={handleColorChange}
        >
          {Object.keys(colors).map(colorName => {
            // Create the theme so that the menu item has the color of the tag
            const theme = createThemeFromColorName(colorName);
            return (
              <MenuItem
                value={colorName}
                key={colorName}
                style={{
                  color: theme.palette.primary.contrastText,
                  backgroundColor: theme.palette.primary.main,
                }}
              >
                {capitalizeFirstLetter(colorName)}
              </MenuItem>
            );
          })}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Save (Enter)</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTagDialog;
