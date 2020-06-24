import React, { useState } from 'react';
import { TextField } from '@material-ui/core';

export type NoteProps = {
  saveNote: (note: string) => void;
  note: string;
  label: string;
};

function Note(props: NoteProps): JSX.Element {
  const { note: initialNote, label } = props;
  const [note, setNote] = useState(initialNote);

  function handleNoteChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setNote(event.target.value);
  }

  function handleLoseFocus(): void {
    props.saveNote(note);
  }
  return (
    <TextField
      multiline
      id="note"
      label={label}
      value={note}
      onChange={handleNoteChange}
      fullWidth
      onBlur={handleLoseFocus}
    />
  );
}

export default Note;
