// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Action, Dispatch, Store} from 'redux';
import shallowEqual from './shallowEqual';

export const StoreContext = createContext<Store<any> | null>(null);

const CONTEXT_ERROR_MESSAGE =
  'redux-react-hook requires your Redux store to ' +
  'be passed through context via the <StoreContext.Provider>';

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
export function useMappedState<TState, TResult>(
  mapState: (state: TState) => TResult,
): TResult {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error(CONTEXT_ERROR_MESSAGE);
  }

  const [derivedState, setDerivedState] = useState(() =>
    mapState(store.getState()),
  );

  useEffect(
    () => {
      let didUnsubscribe = false;

      // Run the mapState callback and if the result has changed, make the
      // component re-render with the new state.
      const checkForUpdates = () => {
        if (didUnsubscribe) {
          // Don't run stale listeners.
          // Redux doesn't guarantee unsubscriptions happen until next dispatch.
          return;
        }
        setDerivedState(oldDerivedState => {
          const nextDerivedState = mapState(store.getState());
          return shallowEqual(oldDerivedState, nextDerivedState)
            ? oldDerivedState
            : nextDerivedState;
        });
      };

      // Pull data from the store after first render in case the store has
      // changed since we began.
      checkForUpdates();

      // Subscribe to the store to be notified of subsequent changes.
      const unsubscribe = store.subscribe(checkForUpdates);

      // The return value of useEffect will be called when unmounting, so
      // we use it to unsubscribe from the store.
      return () => {
        didUnsubscribe = true;
        unsubscribe();
      };
    },
    [store, mapState],
  );

  return derivedState;
}

export function useDispatch<TAction extends Action>(): Dispatch<TAction> {
  const store = useContext(StoreContext);
  if (!store) {
    throw new Error(CONTEXT_ERROR_MESSAGE);
  }
  return store.dispatch;
}
