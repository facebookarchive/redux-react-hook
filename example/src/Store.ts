// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {Action, createStore, Store} from 'redux';
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

export function makeStore(): Store<IState, Action> {
  return createStore(reducer, INITIAL_STATE);
}

export const INITIAL_STATE: IState = {
  lastUpdated: 0,
  todos: [
    'Make the fire!',
    'Fix the breakfast!',
    'Wash the dishes!',
    'Do the mopping!',
  ],
};
