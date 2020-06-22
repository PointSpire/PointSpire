/**
 * It seems that this file needs to stay in the `src` directory.
 *
 * - Tony
 */

import React from 'react';
import ReactDOM from 'react-dom';
/**
 * Used to provide the date picker library to the rest of the application
 */
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
/**
 * Currently using Moment.js for date picker thangs ⏳🌍
 */
import MomentUtils from '@date-io/moment';
import './main/index.css';
import App from './main/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <>
    <MuiPickersUtilsProvider utils={MomentUtils}>
      <App />
    </MuiPickersUtilsProvider>
  </>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
