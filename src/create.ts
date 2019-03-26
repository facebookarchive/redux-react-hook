// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {createContext, useContext, useEffect, useRef, useState} from 'react';
import {Action, ActionCreatorsMapObject, Dispatch, Store} from 'redux';
import shallowEqual from './shallowEqual';

type InferArgs<F> = F extends () => unknown
  ? never[]
  : F extends (...args: infer T) => unknown
    ? T
    : never;
export type DispatchMap<T> = {
  [K in keyof T]: (...args: InferArgs<T[K]>) => void
};

class MissingProviderError extends Error {
  constructor() {
    super(
      'redux-react-hook requires your Redux store to be passed through ' +
        'context via the <StoreContext.Provider>',
    );
  }
}

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
  useBoundActionCreators: <T extends ActionCreatorsMapObject>(
    actions: T,
  ) => DispatchMap<T>;
  useDispatch: () => Dispatch<TAction>;
  useMappedState: <TResult>(mapState: (state: TState) => TResult) => TResult;
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
      throw new MissingProviderError();
    }
    const runMapState = () => mapState(store.getState());

    const [derivedState, setDerivedState] = useState(runMapState);

    const lastStore = useRef(store);
    const lastMapState = useRef(mapState);

    const wrappedSetDerivedState = () => {
      const newDerivedState = runMapState();
      setDerivedState(lastDerivedState =>
        shallowEqual(newDerivedState, lastDerivedState)
          ? lastDerivedState
          : newDerivedState,
      );
    };

    // If the store or mapState change, rerun mapState
    if (lastStore.current !== store || lastMapState.current !== mapState) {
      lastStore.current = store;
      lastMapState.current = mapState;
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
      throw new MissingProviderError();
    }
    return store.dispatch;
  }

  /**
   * Bind a collection of action creators to the dispatch function from the
   * current context. Like `mapDispatchToProps` from react-redux.
   */
  const useBoundActionCreators = <T extends ActionCreatorsMapObject>(
    actions: T,
  ): DispatchMap<T> => {
    const dispatch = useDispatch();
    const map: {[key: string]: Function} = {};
    Object.keys(actions).forEach((key) => {
      const ac = actions[key];
      map[key] = (...args: InferArgs<typeof ac>) => dispatch(ac(...args));
    });
    return map as DispatchMap<T>;
  };

  return {
    StoreContext,
    useBoundActionCreators,
    useDispatch,
    useMappedState,
  };
}
