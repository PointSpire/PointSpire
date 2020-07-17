import React, { useState } from 'react';
import {
  DialogTitle,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  colors as materialUIColors,
  MenuItem,
} from '@material-ui/core';
import { UserTag } from '../../utils/dbTypes';
import UserData from '../../clientData/UserData';

type ColorValues = {
  [colorNumber: string]: string;
};

/**
 * Used to allow indexing of properties on the colors object.
 */
type Colors = {
  [colorName: string]: ColorValues;
};

const colors: Colors = materialUIColors;

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
          {Object.keys(colors).map(colorName => (
            <MenuItem value={colorName} key={colorName}>
              {colorName}
            </MenuItem>
          ))}
        </Select>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Save (Enter)</Button>
      </DialogActions>
    </Dialog>
  );
}

export default EditTagDialog;
