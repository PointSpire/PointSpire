import React, { useState, useEffect } from 'react';
import { TextField, InputBase } from '@material-ui/core';
import { resetTimer } from '../logic/savingTimer';
import ClientData from '../logic/ClientData/ClientData';
import { CompletableType } from '../logic/dbTypes';

export type SimpleTextInputProps = {
  completableType: CompletableType;
  completableId: string;
  completablePropertyName: string;
  label: string;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  mobile?: boolean;
  fullWidth?: boolean;
};

function SimpleTextInput(props: SimpleTextInputProps): JSX.Element {
  const {
    label,
    className,
    completableId,
    completableType,
    completablePropertyName,
    onClick,
    mobile = false,
    fullWidth = false,
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

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setValue(event.target.value);
    resetTimer();
  }

  function handleLoseFocus(): void {
    if (
      ClientData.getCompletable(completableType, completableId)[
        completablePropertyName
      ] !== value
    ) {
      ClientData.setAndSaveCompletableProperty(
        completableType,
        completableId,
        completablePropertyName,
        value
      );
    }
  }

  return (
    <>
      {mobile ? (
        <InputBase
          className={className}
          readOnly
          disabled={disabled}
          value={value}
          onClick={onClick}
        />
      ) : (
        <TextField
          className={className}
          disabled={disabled}
          size="small"
          fullWidth={fullWidth}
          label={label}
          value={value}
          onChange={handleChange}
          onBlur={handleLoseFocus}
        />
      )}
    </>
  );
}

export default SimpleTextInput;
