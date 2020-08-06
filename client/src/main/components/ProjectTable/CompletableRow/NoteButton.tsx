import React from 'react';
import { Tooltip, IconButton } from '@material-ui/core';
import NotesIcon from '@material-ui/icons/Notes';

export type NoteButtonProps = {
  noteOpen: boolean;
  setNoteOpen: (noteOpen: boolean) => void;
  noteIsEmpty: boolean;
};

function NoteButton(props: NoteButtonProps): JSX.Element {
  const { noteOpen, setNoteOpen, noteIsEmpty } = props;
  return (
    <Tooltip title={noteOpen ? 'Close Note' : 'Open Note'}>
      <IconButton
        color={noteIsEmpty ? 'default' : 'primary'}
        size="small"
        onClick={() => {
          setNoteOpen(!noteOpen);
        }}
      >
        <NotesIcon />
      </IconButton>
    </Tooltip>
  );
}

export default NoteButton;
