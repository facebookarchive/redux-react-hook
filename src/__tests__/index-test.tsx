// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {act} from 'react-dom/test-utils';
import {Store, createStore as createReduxStore} from 'redux';
import {
  StoreContext,
  create,
  useBoundActionCreators,
  useDispatch,
  useMappedState,
} from '..';

interface IAction {
  type: 'add todo';
}

interface IState {
  bar: number;
  foo: string;
}

describe('redux-react-hook', () => {
  let subscriberCallback: (() => void) | null;
  let state: IState;
  let cancelSubscription: () => void;
  let store: Store<IState, IAction>;
  let reactRoot: HTMLDivElement;

  const createStore = (): Store<IState, IAction> => ({
    dispatch: jest.fn(action => action),
    getState: () => state,
    subscribe: jest.fn((l: () => void) => {
      subscriberCallback = l;
      return cancelSubscription;
    }),
    // tslint:disable-next-line:no-empty
    replaceReducer() {},
  });

  function updateStore(newState: IState) {
    state = newState;
    act(() => {
      if (subscriberCallback) {
        subscriberCallback();
      }
    });
  }

  beforeEach(() => {
    cancelSubscription = jest.fn();
    state = {bar: 123, foo: 'bar'};
    store = createStore();

    reactRoot = document.createElement('div');
    document.body.appendChild(reactRoot);
  });

  afterEach(() => {
    document.body.removeChild(reactRoot);
    subscriberCallback = null;
  });

  function render(element: React.ReactElement<any>) {
    act(() => {
      ReactDOM.render(
        <StoreContext.Provider value={store}>{element}</StoreContext.Provider>,
        reactRoot,
      );
    });
  }

  function getText() {
    return reactRoot.textContent;
  }

  describe('useMappedState', () => {
    it('renders with state from the store', () => {
      const mapState = (s: IState) => s.foo;
      const Component = () => {
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);

      expect(getText()).toBe('bar');
    });

    it('rerenders with new state when the subscribe callback is called', () => {
      const mapState = (s: IState) => s.foo;
      const Component = () => {
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);

      updateStore({bar: 123, foo: 'foo'});

      expect(getText()).toBe('foo');
    });

    it('cancels subscription on unmount', () => {
      const mapState = (s: IState) => s.foo;
      const Component = () => {
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);

      ReactDOM.unmountComponentAtNode(reactRoot);

      expect(cancelSubscription).toHaveBeenCalled();
    });

    it('does not rerender if the selected state has not changed', () => {
      const mapState = (s: IState) => s.foo;
      let renderCount = 0;
      const Component = () => {
        const foo = useMappedState(mapState);
        renderCount++;
        return (
          <div>
            {foo} {renderCount}
          </div>
        );
      };

      render(<Component />);

      expect(getText()).toBe('bar 1');

      updateStore({bar: 456, ...state});

      expect(getText()).toBe('bar 1');
    });

    it('rerenders if the mapState function changes', () => {
      const Component = ({n}: {n: number}) => {
        const mapState = React.useCallback((s: IState) => s.foo + ' ' + n, [n]);
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component n={100} />);

      expect(getText()).toBe('bar 100');

      render(<Component n={45} />);

      expect(getText()).toBe('bar 45');
    });

    it('rerenders if the store changes', () => {
      const mapState = (s: IState) => s.foo;
      const Component = () => {
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);

      expect(getText()).toBe('bar');

      store = createStore();
      state = {...state, foo: 'hello'};

      render(<Component />);

      expect(getText()).toBe('hello');
    });

    it('uses the latest state if the store updates before subscribing', () => {
      const Component = () => {
        const mapState = React.useCallback((s: IState) => s.foo, []);
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);

      updateStore({...state, foo: 'foo'});

      expect(getText()).toBe('foo');
    });

    it('calls the correct mapState if mapState changes and the store updates', () => {
      const Component = ({n}: {n: number}) => {
        const mapState = React.useCallback((s: IState) => s.foo + ' ' + n, [n]);
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component n={100} />);
      render(<Component n={45} />);

      updateStore({...state, foo: 'foo'});

      expect(getText()).toBe('foo 45');
    });

    it("doesn't try to update after unmounting during dispatch", () => {
      let mapStateCalls = 0;
      const Component = () => {
        const mapState = React.useCallback((s: IState) => {
          mapStateCalls++;
          return s.foo;
        }, []);
        const foo = useMappedState(mapState);
        return <div>{foo}</div>;
      };

      render(<Component />);
      ReactDOM.unmountComponentAtNode(reactRoot);

      const consoleErrorSpy = jest.spyOn(console, 'error');
      updateStore({...state, foo: 'foo'});

      // mapState is called during and after the first render
      expect(mapStateCalls).toBe(2);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('renders last state after synchronous dispatches', () => {
      const store = createReduxStore(
        (state: number = 0, action: any): number =>
          action.type === 'test' ? action.payload : state,
      );

      const mapState = (s: number) => s;
      const Component = () => {
        const bar = useMappedState(mapState);
        return <div>{bar}</div>;
      };

      render(
        <StoreContext.Provider value={store}>
          <Component />
        </StoreContext.Provider>,
      );

      act(() => {
        store.dispatch({
          type: 'test',
          payload: 1,
        });
        store.dispatch({
          type: 'test',
          payload: 0,
        });
      });

      expect(getText()).toBe('0');
    });

    it('renders once if new mapState returns same mappedState', () => {
      let renderCount = 0;
      const Component = ({prop}: {prop: any}) => {
        const mapState = React.useCallback((s: IState) => s, [prop]);
        useMappedState(mapState);
        React.useEffect(() => {
          renderCount++;
        });
        return null;
      };

      render(<Component prop={1} />);
      render(<Component prop={2} />);

      expect(renderCount).toBe(2);
    });

    it('throws if provider is missing', () => {
      const Component = () => {
        const mapState = React.useCallback((s: IState) => s, []);
        expect(() => {
          useMappedState(mapState);
        }).toThrow();
        return null;
      };
      act(() => {
        ReactDOM.render(<Component />, reactRoot);
      });
    });
  });

  describe('useDispatch', () => {
    it('calls store dispatch', () => {
      const Component = () => {
        const dispatch = useDispatch();
        React.useEffect(() => {
          dispatch({foo: 1});
        });
        return null;
      };

      render(<Component />);

      expect(store.dispatch).toHaveBeenLastCalledWith({foo: 1});
    });

    it('throws if provider is missing', () => {
      const Component = () => {
        expect(() => {
          useDispatch();
        }).toThrow();
        return null;
      };
      act(() => {
        ReactDOM.render(<Component />, reactRoot);
      });
    });
  });

  describe('useBoundActionCreators', () => {
    it('calls store dispatch', () => {
      const ac1 = (arg: string) => arg;
      const ac2 = (a: number, b: number) => ({a, b});
      const ac3 = () => 'ac3';
      const Component = () => {
        const dispatch = useBoundActionCreators({ac1, ac2, ac3});
        React.useEffect(() => {
          dispatch.ac1('foo');
          dispatch.ac2(3, 4);
          dispatch.ac3();
        });
        return null;
      };

      render(<Component />);

      expect(store.dispatch).toHaveBeenCalledTimes(3);
      expect(store.dispatch).toHaveBeenCalledWith('foo');
      expect(store.dispatch).toHaveBeenCalledWith({a: 3, b: 4});
      expect(store.dispatch).toHaveBeenLastCalledWith('ac3');
    });

    it('calls store dispatch (inline action creators)', () => {
      const Component = () => {
        const dispatch = useBoundActionCreators({
          ac1: (arg: string) => arg,
          ac2: (a: number, b: number) => ({a, b}),
          ac3: () => 'ac3',
        });
        React.useEffect(() => {
          dispatch.ac1('foo');
          dispatch.ac2(3, 4);
          dispatch.ac3();
        });
        return null;
      };

      render(<Component />);

      expect(store.dispatch).toHaveBeenCalledTimes(3);
      expect(store.dispatch).toHaveBeenCalledWith({a: 3, b: 4});
      expect(store.dispatch).toHaveBeenLastCalledWith('ac3');
    });
  });

  describe('create', () => {
    it('returns a new context and functions each time', () => {
      const first = create();
      const second = create();
      expect(first.StoreContext).not.toBe(second.StoreContext);
      expect(first.useDispatch).not.toBe(second.useDispatch);
      expect(first.useMappedState).not.toBe(second.useMappedState);
    });
  });
});
