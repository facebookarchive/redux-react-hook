// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {Action, IState, INITIAL_STATE} from './Store';

export default function reducer(state: IState = INITIAL_STATE, action: Action) {
  switch (action.type) {
    case 'add todo': {
      return {
        ...state,
        lastUpdated: Date.now(),
        todos: state.todos.concat(action.todo),
      };
    }

    case 'delete todo': {
      const todos = state.todos.slice();
      todos.splice(action.index, 1);
      return {...state, lastUpdated: Date.now(), todos};
    }

    default:
      return state;
  }
}
