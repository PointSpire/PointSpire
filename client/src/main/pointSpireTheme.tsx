import { createMuiTheme, ThemeOptions } from '@material-ui/core/styles';

export default function buildTheme(): ThemeOptions {
  return createMuiTheme({
    palette: {
      primary: {
        main: '#b2dfdb',
      },
      secondary: {
        main: '#b2b6df',
      },
      error: {
        main: '#dfb2b6',
      },
      warning: {
        main: '#dfdbb2',
      },
      background: {
        paper: '#e9f5f5',
        // paper: '#f5faff',
        // paper: '#f1f7fc',
        // Testing
        // paper: '#6a6e75',
      },
      action: {
        hoverOpacity: 0.2,
      },
      contrastThreshold: 3,
      tonalOffset: 0.2,
    },
    typography: {
      fontSize: 16,
    },
    shape: {
      borderRadius: 6,
    },
  });
}
