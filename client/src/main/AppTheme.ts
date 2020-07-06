import blue from '@material-ui/core/colors/blue';
import { getCookie, ClientCookies } from './logic/clientCookies';

const fontSizeCookie = getCookie(ClientCookies.fontSize);
const fontSize =
  fontSizeCookie === '' ? 14 : Number.parseInt(fontSizeCookie, 10);

/**
 * The basic app theming options. These can be overridden and proivded to the
 * `createMuiTheme` function provided by `@material-ui/core/styles` to create
 * a new theme.
 */
const baseThemeOptions = {
  palette: {
    primary: blue,
  },
  typography: {
    fontSize,
  },
};

export default baseThemeOptions;
