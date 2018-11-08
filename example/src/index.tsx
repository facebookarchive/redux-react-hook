// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {StoreProvider} from './redux-react-hook';

import App from './App';
import {makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <StoreProvider value={store}>
    <App />
  </StoreProvider>,
  document.getElementById('root'),
);
