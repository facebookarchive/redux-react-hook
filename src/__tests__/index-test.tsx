// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Store, createStore as createReduxStore} from 'redux';
import {StoreContext, useMappedState} from '..';

interface IAction {
  type: 'add todo';
}

interface IState {
  bar: number;
  foo: string;
}

describe('redux-react-hook', () => {
  let subscriberCallback: () => void;
  let state: IState;
  let cancelSubscription: () => void;
  let store: Store<IState, IAction>;
  let reactRoot: HTMLDivElement;

  const createStore = (): Store<IState, IAction> => ({
    dispatch: (action: any) => action,
    getState: () => state,
    subscribe: jest.fn((l: () => void) => {
      subscriberCallback = l;
      return cancelSubscription;
    }),
    // tslint:disable-next-line:no-empty
    replaceReducer() {},
  });

  beforeEach(() => {
    cancelSubscription = jest.fn();
    state = {bar: 123, foo: 'bar'};
    store = createStore();

    reactRoot = document.createElement('div');
    document.body.appendChild(reactRoot);
  });

  afterEach(() => {
    document.body.removeChild(reactRoot);
  });

  function render(element: React.ReactElement<any>) {
    ReactDOM.render(
      <StoreContext.Provider value={store}>{element}</StoreContext.Provider>,
      reactRoot,
    );
  }

  function getText() {
    return reactRoot.textContent;
  }

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

    state = {bar: 123, foo: 'foo'};
    subscriberCallback();

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

    state = {bar: 456, ...state};
    subscriberCallback();

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

    state = {...state, foo: 'foo'};
    subscriberCallback();

    // run the useEffect that subscribes to the store
    flushEffects();

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

    flushEffects();

    state = {...state, foo: 'foo'};
    subscriberCallback();

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

    flushEffects();

    ReactDOM.unmountComponentAtNode(reactRoot);

    const consoleErrorSpy = jest.spyOn(console, 'error');
    state = {...state, foo: 'foo'};
    subscriberCallback();

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

    flushEffects();

    store.dispatch({
      type: 'test',
      payload: 1,
    });
    store.dispatch({
      type: 'test',
      payload: 0,
    });

    expect(getText()).toBe('0');
  });
});

// https://github.com/kentcdodds/react-testing-library/commit/11a41ce3ad9e9695f4b1662a5c67b890fc304894
function flushEffects() {
  ReactDOM.render(<div />, document.createElement('div'));
}
