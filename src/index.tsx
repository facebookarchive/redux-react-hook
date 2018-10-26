import {useContext, useEffect, useRef, useState} from 'react';
import {Action, Dispatch, Store} from 'redux';

/**
 * Your passed in mapState function should be memoized to avoid
 * resubscribing every render. If you use other props in mapState, use
 * useCallback to memoize the resulting function, otherwise define the mapState
 * function outside of the component:
 *
 * const mapState = useCallback(
 *   state => state.todos.get(id),
 *   // The second parameter to useCallback tells you
 *   [id],
 * );
 * const todo = useStore(mapState);
 */
export function useStore<TState, TResult>(
  storeContext: React.Context<Store<TState>>,
  mapState: (state: TState) => TResult,
): TResult {
  const store = useContext(storeContext);
  const [mappedState, setMappedState] = useState(() =>
    mapState(store.getState()),
  );

  const [prevStore, setPrevStore] = useState(store);
  const [prevMapState, setPrevMapState] = useState(() => mapState);
  if (prevStore !== store || prevMapState !== mapState) {
    setPrevStore(store);
    setPrevMapState(() => mapState);
    setMappedState(mapState(store.getState()));
  }

  // We use this to store local component state so we don't have
  // to unsubscribe and resubscribe from redux everytime the state changes.
  const lastRenderedMappedState = useRef();
  useEffect(() => {
    lastRenderedMappedState.current = mappedState;
  });
  useEffect(
    () => {
      const checkForUpdates = () => {
        const newMappedState = mapState(store.getState());
        if (!shallowEqual(newMappedState, lastRenderedMappedState.current)) {
          setMappedState(newMappedState);
        }
      };
      checkForUpdates();
      const unsubscribe = store.subscribe(checkForUpdates);
      return unsubscribe;
    },
    [store, mapState],
  );
  return mappedState;
}

export function useDispatch<TAction extends Action>(
  storeContext: React.Context<Store<any, TAction>>,
): Dispatch<TAction> {
  const store = useContext(storeContext);
  return store.dispatch;
}

function shallowEqual(objA: any, objB: any): boolean {
  if (objA === objB) {
    return true;
  }

  if (
    typeof objA !== 'object' ||
    objA === null ||
    typeof objB !== 'object' ||
    objB === null
  ) {
    return false;
  }

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, keysA[i]) ||
      objA[keysA[i]] !== objB[keysA[i]]
    ) {
      return false;
    }
  }

  return true;
}
