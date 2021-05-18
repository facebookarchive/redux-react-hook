// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import {Action, Dispatch, Store} from 'redux';

// React currently throws a warning when using useLayoutEffect on the server.
// To get around it, we can conditionally useEffect on the server (no-op) and
// useLayoutEffect in the browser.

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

class MissingProviderError extends Error {
  constructor() {
    super(
      'redux-react-hook requires your Redux store to be passed through ' +
        'context via the <StoreContext.Provider>',
    );
  }
}

// Init `prevArg` with a local object to ensure the first non-equality check
// with `arg` always yield `true`, resulting in correctly calling `fn` and
// assigning `arg` to `prevArg`.
const initialPrevArg = {};

function memoizeSingleArg<AT, RT>(fn: (arg: AT) => RT): (arg: AT) => RT {
  let value: RT;
  let prevArg: AT | typeof initialPrevArg = initialPrevArg;

  return (arg: AT) => {
    if (prevArg !== arg) {
      value = fn(arg);
      prevArg = arg;
    }
    return value;
  };
}

function referenceEqual(a: unknown, b: unknown): boolean {
  return a === b;
}

/**
 * To use redux-react-hook with stronger type safety, or to use with multiple
 * stores in the same app, create() your own instance and re-export the returned
 * functions.
 */
export function create<
  TState,
  TAction extends Action,
  TStore extends Store<TState, TAction>,
>({
  defaultEqualityCheck = referenceEqual,
}: {defaultEqualityCheck?: (a: unknown, b: unknown) => boolean} = {}): {
  StoreContext: React.Context<TStore | null>;
  useMappedState: <TResult>(
    mapState: (state: TState) => TResult,
    equalityCheck?: (a: TResult, b: TResult) => boolean,
  ) => TResult;
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
    equalityCheck: (a: TResult, b: TResult) => boolean = defaultEqualityCheck,
  ): TResult {
    const store = useContext(StoreContext);
    if (!store) {
      throw new MissingProviderError();
    }

    // We don't keep the derived state but call mapState on every render with current state.
    // This approach guarantees that useMappedState returns up-to-date derived state.
    // Since mapState can be expensive and must be a pure function of state we memoize it.
    const memoizedMapState = useMemo(
      () => memoizeSingleArg(mapState),
      [mapState],
    );

    const state = store.getState();
    const derivedState = memoizedMapState(state);

    // Since we don't keep the derived state we still need to trigger
    // an update when derived state changes.
    const [, forceUpdate] = useState(0);

    // Keep previously commited derived state in a ref. Compare it to the new
    // one when an action is dispatched and call forceUpdate if they are different.
    const lastStateRef = useRef(derivedState);

    const memoizedMapStateRef = useRef(memoizedMapState);

    // We use useLayoutEffect to render once if we have multiple useMappedState.
    // We need to update lastStateRef synchronously after rendering component,
    // With useEffect we would have:
    // 1) dispatch action
    // 2) call subscription cb in useMappedState1, call forceUpdate
    // 3) rerender component
    // 4) call useMappedState1 and useMappedState2 code
    // 5) calc new derivedState in useMappedState2, schedule updating lastStateRef, return new state, render component
    // 6) call subscription cb in useMappedState2, check if lastStateRef !== newDerivedState, call forceUpdate, rerender.
    // 7) update lastStateRef - it's too late, we already made one unnecessary render
    useIsomorphicLayoutEffect(() => {
      lastStateRef.current = derivedState;
      memoizedMapStateRef.current = memoizedMapState;
    });

    useIsomorphicLayoutEffect(() => {
      let didUnsubscribe = false;

      // Run the mapState callback and if the result has changed, make the
      // component re-render with the new state.
      const checkForUpdates = () => {
        if (didUnsubscribe) {
          // Don't run stale listeners.
          // Redux doesn't guarantee unsubscriptions happen until next dispatch.
          return;
        }

        const newDerivedState = memoizedMapStateRef.current(store.getState());

        if (!equalityCheck(newDerivedState, lastStateRef.current)) {
          forceUpdate(increment);
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
    }, [store]);

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

function increment(x: number): number {
  return x + 1;
}
