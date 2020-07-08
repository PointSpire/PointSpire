import React, { useState, useEffect } from 'react';
import { TextField } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';
import ClientData from '../logic/ClientData';
import { CompletableType } from '../logic/dbTypes';

export type SimpleTextInputProps = {
  completableType: CompletableType;
  completableId: string;
  completablePropertyName: string;
  label: string;
  className?: string;
};

function SimpleTextInput(props: SimpleTextInputProps): JSX.Element {
  const {
    label,
    className,
    completableId,
    completableType,
    completablePropertyName,
  } = props;
  const [value, setValue] = useState(
    ClientData.getCompletable(completableType, completableId)[
      completablePropertyName
    ]
  );
  const [disabled, setDisabled] = useState(
    ClientData.getCompletable(completableType, completableId).completed
  );

  /**
   * The ID for this listener when set on some property or completable.
   */
  const listenerId = `${completableId}.SimpleTextInput.${completablePropertyName}`;

  /**
   * Add the property listener for the completed value so that it disables
   * the text input when the completable is completed.
   */
  useEffect(() => {
    ClientData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      'completed',
      updatedValue => {
        setDisabled(updatedValue as boolean);
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      ClientData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        'completed'
      );
    };
  }, []);

  /**
   * Add the property listener for the text. This could be skipped likely and
   * just set manually when the text is changed. But this allows for the text
   * to be changed by other components as well.
   */
  useEffect(() => {
    ClientData.addCompletablePropertyListener(
      completableType,
      completableId,
      listenerId,
      completablePropertyName,
      updatedValue => {
        if (updatedValue !== value) {
          setValue(updatedValue as string);
        }
      }
    );

    // This will be ran when the component is unmounted
    return function cleanup() {
      ClientData.removeCompletablePropertyListener(
        completableType,
        completableId,
        listenerId,
        completablePropertyName
      );
    };
  }, []);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    if (completableId !== value) {
      // saveValue(value);
    }
  }

  return (
    <TextField
      className={className}
      disabled={disabled}
      size="small"
      fullWidth
      label={label}
      value={value}
      onChange={handleChange}
      onBlur={handleLoseFocus}
    />
  );
}

export default SimpleTextInput;
