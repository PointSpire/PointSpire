/**
 * This file is meant to be used as an easy way to access colors from
 * Material-UI.
 */

import {
  colors as materialUIColors,
  createMuiTheme,
  Theme,
} from '@material-ui/core';

export type ColorValues = {
  [colorNumber: string]: string;
};

/**
 * Used to allow indexing of properties on the colors object.
 */
export type Colors = {
  [colorName: string]: ColorValues;
};

/**
 * The indexable colors object. Created off of the @material-ui/core/colors
 * object with a coerced type for indexing purposes.
 */
const colors: Colors = { ...materialUIColors };

// Remove the common color, it is just black and white.
delete colors.common;

export default colors;

/**
 * Creates a theme with the provided color as the primary main color. This is
 * useful to automatically generate contrasting colors which can be used in
 * styles.
 *
 * @param {string} color the color to set as the primary color for the theme
 * @returns {Theme} the created theme for the color
 */
export function createThemeForColor(color: string): Theme {
  return createMuiTheme({
    palette: {
      primary: {
        main: color,
      },
    },
  });
}

/**
 * Creates a theme with the provided color name as the primary main color.
 * The color name has to be one of the colors included in the material UI
 * colors object. This will return a theme with the `700` variant of the color.
 *
 * @param {string} colorName the name of the color that must be in the material
 * UI colors object
 * @returns {Theme} the created theme off of the color name
 */
export function createThemeFromColorName(colorName: string): Theme {
  return createThemeForColor(colors[colorName][700]);
}
