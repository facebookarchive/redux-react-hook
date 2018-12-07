// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Store} from 'redux';
import {StoreContext, useMappedState} from '..';

interface IAction {
  type: 'add todo';
}

interface IState {
  bar: number;
  foo: string;
}

// https://github.com/kentcdodds/react-testing-library/issues/215
// useEffect is not triggered on re-renders
beforeAll(() =>
  jest.spyOn(React, 'useEffect').mockImplementation(React.useLayoutEffect),
);
afterAll(() => (React.useEffect as any).mockRestore());

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

  it('calls the correct mapState if mapState changes and the store updates', () => {
    const Component = ({n}: {n: number}) => {
      const mapState = React.useCallback((s: IState) => s.foo + ' ' + n, [n]);
      const foo = useMappedState(mapState);
      return <div>{foo}</div>;
    };

    render(<Component n={100} />);
    render(<Component n={45} />);

    state = {...state, foo: 'foo'};
    subscriberCallback();

    expect(getText()).toBe('foo 45');
  });
});
