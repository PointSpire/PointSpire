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
 * Represents the textual input for a priority. This handles validation on the
 * input.
 *
 * @param {FontSizeSettingProps} props the props
 */
function FontSizeSetting(props: FontSizeSettingProps): JSX.Element {
  const { setFontSize, fontSize, classes } = props;

  const [input, setInput] = useState<string>(fontSize.toString());
  const [error, setError] = useState(false);
  const [helperText, setHelperText] = useState('');

  function validateInput(value: string): void {
    if (value.length === 0) {
      setError(true);
      setHelperText('Please enter a font size number');
    } else if (!Number.isNaN(Number.parseInt(value, 10))) {
      setError(false);
      setHelperText('');
    } else {
      setError(true);
      setHelperText('Please enter a non-decimal integer');
    }
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>): void {
    setInput(event.target.value);
    validateInput(event.target.value);
  }

  function handleLoseFocus(): void {
    if (!error) {
      setFontSize(Number.parseInt(input, 10));
    }
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
          onBlur={handleLoseFocus}
        />
        <FormHelperText id="font-size-helper-text">{helperText}</FormHelperText>
      </FormControl>
    </div>
  );
}

export default withStyles(styles, { withTheme: false })(FontSizeSetting);
