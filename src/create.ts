// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {Action, Dispatch, Store} from 'redux';
import shallowEqual from './shallowEqual';

class MissingProviderError extends Error {
  constructor() {
    super(
      'redux-react-hook requires your Redux store to be passed through ' +
        'context via the <StoreContext.Provider>',
    );
  }
}

function memoizeSingleArg<AT, RT>(fn: (arg: AT) => RT): (arg: AT) => RT {
  let value: RT;
  let prevArg: AT;

  return (arg: AT) => {
    if (prevArg !== arg) {
      prevArg = arg;
      value = fn(arg);
    }
    return value;
  };
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
      throw new MissingProviderError();
    }

    // We don't keep the derived state but call mapState on every render with current state.
    // This approach guarantees that useMappedState returns up-to-date derived state.
    // Since mapState can be expensive and must be a pure function of state we memoize it.
    const memoizedMapState = useMemo(() => memoizeSingleArg(mapState), [
      mapState,
    ]);

    const state = store.getState();
    const derivedState = memoizedMapState(state);

    // Since we don't keep the derived state we still need to trigger
    // an update when derived state changes.
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    // Keep previously commited derived state in a ref.
    // Compare it to the a one when an action is dispatched
    // and call forceUpdate if they are different.
    // We could rely on React's bail out it makes a component
    // render which is not necessary in that case.
    const lastStateRef = useRef(derivedState);

    useEffect(() => {
      lastStateRef.current = derivedState;
    });

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

        const newDerivedState = memoizedMapState(store.getState());

        if (!shallowEqual(newDerivedState, lastStateRef.current)) {
          // In TS definitions userReducer's dispatch requires an argument
          (forceUpdate as () => void)();
        }
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
    }, [store, memoizedMapState]);

    return derivedState;
  }

  function useDispatch(): Dispatch<TAction> {
    const store = useContext(StoreContext);
    if (!store) {
      throw new MissingProviderError();
    }
    return store.dispatch;
  }

  return {
    StoreContext,
    useDispatch,
    useMappedState,
  };
}
