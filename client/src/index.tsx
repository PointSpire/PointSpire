/**
 * It seems that this file needs to stay in the `src` directory.
 *
 * - Tony
 */

import React from 'react';
import ReactDOM from 'react-dom';
import './main/index.css';
import App from './main/App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
