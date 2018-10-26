import React from 'react';
import ReactDOM from 'react-dom';

import './index.css';
import App from './App.react';
import {Context, makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <Context.Provider value={store}>
    <App />
  </Context.Provider>,
  document.getElementById('root'),
);
