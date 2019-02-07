// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import React from 'react';
import ReactDOM from 'react-dom';
import {StoreContext} from './Store';

import App from './App';
import {makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root'),
);
