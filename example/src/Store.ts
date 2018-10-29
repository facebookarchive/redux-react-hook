import * as React from 'react';
import {Action, createStore} from 'redux';
import {
  useDispatch as useDispatchGeneric,
  useMappedState as useMappedStateGeneric,
} from 'redux-react-hook';
import reducer from './reducer';

export interface IState {
  lastUpdated: number;
  todos: string[];
}

export type Action =
  | {
      type: 'add todo';
      todo: string;
    }
  | {
      type: 'delete todo';
      index: number;
    };

export function makeStore() {
  return createStore(reducer, {
    lastUpdated: 0,
    todos: ['alpha', 'beta', 'gamma'],
  });
}

export const Context = React.createContext(makeStore());

export function useMappedState<T>(mapState: (state: IState) => T): T {
  // Wrap the generic useMappedState so that you don't have to pass in the store Context all over
  // If you want to pass only a subset of state, this is also the place to do it. For example,
  // if your store schema has an undo stack, and you only want to pass the current state.
  return useMappedStateGeneric(Context, mapState);
}

export function useDispatch() {
  return useDispatchGeneric(Context);
}
