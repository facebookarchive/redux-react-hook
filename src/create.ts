// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Action, Dispatch, Store} from 'redux';
import shallowEqual from './shallowEqual';

const CONTEXT_ERROR_MESSAGE =
  'redux-react-hook requires your Redux store to ' +
  'be passed through context via the <StoreContext.Provider>';

/**
 * To use redux-react-hook with stronger type safety, or to use with multiple
 * stores in the same app, create() your own instance and re-export the returned
 * functions.
 */
export function create<
  TState,
  TAction extends Action,
  TStore extends Store<TState, TAction>
>(): {
  StoreContext: React.Context<TStore | null>;
  useMappedState: <TResult>(mapState: (state: TState) => TResult) => TResult;
  useDispatch: () => Dispatch<TAction>;
} {
  const StoreContext = createContext<TStore | null>(null);

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
  function useMappedState<TResult>(
    mapState: (state: TState) => TResult,
  ): TResult {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(CONTEXT_ERROR_MESSAGE);
    }
    const mapStateFactory = () => mapState;
    const runMapState = () => mapState(store.getState());

    const [derivedState, setDerivedState] = useState(runMapState);

    // If the store or mapState change, rerun mapState
    const [prevStore, setPrevStore] = useState(store);
    const [prevMapState, setPrevMapState] = useState(mapStateFactory);

    // We keep lastDerivedState in a ref and update it imperatively
    // after calling setDerivedState so it's always up-to-date.
    // We can't update it in useEffect because state might be updated
    // synchronously multiple times before render occurs.
    const lastDerivedState = useRef(derivedState);

    const wrappedSetDerivedState = () => {
      const newDerivedState = runMapState();
      if (!shallowEqual(newDerivedState, lastDerivedState.current)) {
        setDerivedState(newDerivedState);
        lastDerivedState.current = newDerivedState;
      }
    };

    if (prevStore !== store || prevMapState !== mapState) {
      setPrevStore(store);
      setPrevMapState(mapStateFactory);
      wrappedSetDerivedState();
    }

    useEffect(() => {
      let didUnsubscribe = false;

      // Run the mapState callback and if the result has changed, make the
      // component re-render with the new state.
      const checkForUpdates = () => {
        if (didUnsubscribe) {
          // Don't run stale listeners.
          // Redux doesn't guarantee unsubscriptions happen until next dispatch.
          return;
        }

        wrappedSetDerivedState();
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
    }, [store, mapState]);

    return derivedState;
  }

  function useDispatch(): Dispatch<TAction> {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(CONTEXT_ERROR_MESSAGE);
    }
    return store.dispatch;
  }

  return {
    StoreContext,
    useDispatch,
    useMappedState,
  };
}
