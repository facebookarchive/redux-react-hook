// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

/// <reference types="react" />
/// <reference types="redux" />

import {Context} from 'react';
import {Action, Dispatch, Store} from 'redux';

/**
 * To use redux-react-hook with stronger type safety, or to use with multiple
 * stores in the same app, create() your own instance and re-export the returned
 * functions.
 */
export declare function create<
  TState,
  TAction extends Action,
  TStore extends Store<TState, TAction>,
  TDispatch = Dispatch<TAction>
>(): {
  StoreContext: React.Context<TStore | null>;
  useMappedState: <TResult>(mapState: (state: TState) => TResult) => TResult;
  useDispatch: () => TDispatch;
};

export declare const StoreContext: Context<any>;
export declare const useDispatch: <TDispatch = Dispatch<any>>() => TDispatch;

/**
 * Your passed in mapState function should be memoized with useCallback to avoid
 * resubscribing every render. If you don't use other props in mapState, pass
 * an empty array [] as the dependency list so the callback isn't recreated
 * every render.
 *
 * const todo = useMappedState(useCallback(
 *   state => state.todos.get(id),
 *   [id],
 * ));
 */
export declare const useMappedState: <TResult>(
  mapState: (state: any) => TResult,
  equalityCheck?: (a: any, b: any) => boolean,
) => TResult;
