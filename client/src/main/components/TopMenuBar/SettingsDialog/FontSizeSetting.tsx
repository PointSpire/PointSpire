import React, { useState } from 'react';
import {
  Input,
  InputLabel,
  FormControl,
  FormHelperText,
  Typography,
  createStyles,
  withStyles,
  WithStyles,
} from '@material-ui/core';

function styles() {
  return createStyles({
    root: {
      display: 'flex',
      flexDirection: 'column',
    },
  });
}

export interface FontSizeSettingProps extends WithStyles<typeof styles> {
  setFontSize: (fontSize: number) => void;
  fontSize: number;
}

/**
 * Represents the setting for the font size. This handles validation on the
 * input.
 *
 * @param {FontSizeSettingProps} props the props
 */
function FontSizeSetting(props: FontSizeSettingProps): JSX.Element {
  const { setFontSize, fontSize, classes } = props;

  const [input, setInput] = useState<string>(fontSize.toString());
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  /**
   * Validates the font size input from the user by setting the helper text
   * and the error state corresponding to the value being correct or
   * incorrect.
   *
   * @param {string} value the input value from the user
   */
  function validateInput(value: string): void {
    const parsedValue = Number.parseInt(value, 10);
    if (value.length === 0) {
      setError(true);
      setHelperText('Please enter a font size number');
    } else if (!Number.isNaN(parsedValue) && parsedValue > 0) {
      setError(false);
      setHelperText('');
      setFontSize(parsedValue);
    } else {
      setError(true);
      setHelperText('Please enter a non-decimal integer more than 0');
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value);
    validateInput(event.target.value);
  }

  return (
    <div className={classes.root}>
      <Typography variant="body1">App Font Size</Typography>
      <FormControl error={error} size="small">
        <InputLabel htmlFor="font-size-input">Font Size</InputLabel>
        <Input
          id="font-size-input"
          aria-describedby="font-size-helper-text"
          value={input}
          onChange={handleChange}
        />
        <FormHelperText id="font-size-helper-text">{helperText}</FormHelperText>
      </FormControl>
    </div>
  );
}

export default withStyles(styles, { withTheme: false })(FontSizeSetting);
