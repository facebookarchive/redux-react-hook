// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import ReactDOM from 'react-dom';
import App from './App';
import {makeStore, StoreContext} from './Store';

const store = makeStore();

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root'),
);
