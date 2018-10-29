import * as React from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import {Context, makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <Context.Provider value={store}>
    <App />
  </Context.Provider>,
  document.getElementById('root'),
);
