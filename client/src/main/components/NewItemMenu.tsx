import React, { ChangeEvent } from 'react';
import {
  IconButton,
  WithStyles,
  createStyles,
  Theme,
  withStyles,
  TextField,
  Menu,
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/DeleteForever';

function styles(theme: Theme) {
  return createStyles({
    root: {
      width: '100%',
      backgroundColor: theme.palette.background.paper,
    },
    nested: {
      paddingLeft: theme.spacing(4),
    },
  });
}

export interface NewItemMenuProps extends WithStyles<typeof styles> {
  itemName: string;
  parentId: string;
  handleConfirm: (parentId: string) => void;
  handleDelete: (parentId: string) => void;
  handleInput: (e: ChangeEvent<HTMLInputElement>) => void;
  handleClose: (state: {
    mouseX: number | null;
    mouseY: number | null;
  }) => void;
  anchor: {
    mouseX: number | null;
    mouseY: number | null;
  };
}

const blankMouse = {
  mouseX: null,
  mouseY: null,
};

function NewItemMenu(props: NewItemMenuProps) {
  const {
    itemName,
    parentId,
    handleConfirm,
    handleDelete,
    handleInput,
    anchor,
    handleClose,
  } = props;

  return (
    <Menu
      keepMounted
      open={anchor.mouseX !== null}
      anchorReference="anchorPosition"
      onClose={() => handleClose(blankMouse)}
      anchorPosition={
        anchor.mouseX && anchor.mouseY
          ? { top: anchor.mouseY, left: anchor.mouseX }
          : undefined
      }
    >
      <TextField
        error={itemName.length === 0}
        label="Task Title"
        onChange={handleInput}
        value={itemName}
      />
      <IconButton onClick={() => handleConfirm(parentId)}>
        <AddIcon />
      </IconButton>
      <IconButton onClick={() => handleDelete(parentId)}>
        <DeleteIcon />
      </IconButton>
    </Menu>
  );
}

export default withStyles(styles, { withTheme: true })(NewItemMenu);
