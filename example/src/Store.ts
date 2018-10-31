import {Action, createStore} from 'redux';
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
