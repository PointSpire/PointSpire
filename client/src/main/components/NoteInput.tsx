import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';

export type NoteInputProps = {
  saveNote: (note: string) => void;
  note: string;
  label: string;
};

function NoteInput(props: NoteInputProps): JSX.Element {
  const { note: initialNote, label } = props;
  const [note, setNote] = useState(initialNote);

  function handleNoteChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setNote(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    props.saveNote(note);
  }
  return (
    <TextField
      size="small"
      multiline
      label={label}
      value={note}
      onChange={handleNoteChange}
      fullWidth
      onBlur={handleLoseFocus}
    />
  );
}

export default NoteInput;
