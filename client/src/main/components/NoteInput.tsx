import React, { useState } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';

export type NoteInputProps = {
  saveNote: (note: string) => void;
  note: string;
  label: string;
};

/**
 * The input for a note in particular. This is a multiline text input that is
 * specified to use `fullWidth` on the `TextField`.
 *
 * @param {NoteInputProps} props the props
 */
function NoteInput(props: NoteInputProps): JSX.Element {
  const { note: initialNote, label } = props;
  const [note, setNote] = useState(initialNote);

  function handleNoteChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setNote(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    if (note !== initialNote) {
      props.saveNote(note);
    }
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
