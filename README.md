# redux-react-hook

> React hook for accessing mapped state and dispatch from a Redux store.

[![Build Status](https://img.shields.io/travis/com/facebookincubator/redux-react-hook.svg)](https://travis-ci.com/facebookincubator/redux-react-hook)
[![NPM](https://img.shields.io/npm/v/redux-react-hook.svg)](https://www.npmjs.com/package/redux-react-hook)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/redux-react-hook.svg)](https://bundlephobia.com/result?p=redux-react-hook@latest)
[![Downloads](https://img.shields.io/npm/dw/redux-react-hook.svg)](https://www.npmjs.com/package/redux-react-hook)

## Table of Contents

- [Install](#install)
- [Quick Start](#quick-start)
- [Usage](#usage)
  - [`StoreContext`](#storecontext)
  - [`useMappedState(mapState, equalityCheck?)`](#usemappedstatemapstate-equalitycheck)
  - [`useDispatch()`](#usedispatch)
  - [`create(options?)`](#createoptions)
- [Example](#example)
- [FAQ](#faq)
- [Related projects](#related-projects)
- [Thanks](#thanks)
- [Contributing](#contributing)
- [License](#license)

## Install

```bash
# Yarn
yarn add redux-react-hook

# NPM
npm install --save redux-react-hook
```

## Quick Start

```tsx
//
// Bootstrap your app
//
import {StoreContext} from 'redux-react-hook';

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root'),
);
```

```tsx
//
// Individual components
//
import {useDispatch, useMappedState} from 'redux-react-hook';
import shallowEqual from 'shallowequal';

export function DeleteButton({index}) {
  // Declare your memoized mapState function
  const mapState = useCallback(
    state => ({
      canDelete: state.todos[index].canDelete,
      name: state.todos[index].name,
    }),
    [index],
  );

  // Get data from and subscribe to the store
  const {canDelete, name} = useMappedState(mapState, shallowEqual);

  // Create actions
  const dispatch = useDispatch();
  const deleteTodo = useCallback(
    () =>
      dispatch({
        type: 'delete todo',
        index,
      }),
    [index],
  );

  return (
    <button disabled={!canDelete} onClick={deleteTodo}>
      Delete {name}
    </button>
  );
}
```

## Usage

NOTE: React hooks require `react` and `react-dom` version `16.8.0` or higher.

### `StoreContext`

Before you can use the hook, you must provide your Redux store via `StoreContext.Provider`:

```tsx
import {createStore} from 'redux';
import {StoreContext} from 'redux-react-hook';
import reducer from './reducer';

const store = createStore(reducer);

ReactDOM.render(
  <StoreContext.Provider value={store}>
    <App />
  </StoreContext.Provider>,
  document.getElementById('root'),
);
```

You can also use the `StoreContext` to access the store directly, which is useful for event handlers that only need more state when they are triggered:

```tsx
import {useContext} from 'react';
import {StoreContext} from 'redux-react-hook';

function Component() {
  const store = useContext(StoreContext);
  const onClick = useCallback(() => {
    const value = selectExpensiveValue(store.getState());
    alert('Value: ' + value);
  });
  return <div onClick={onClick} />;
}
```

### `useMappedState(mapState, equalityCheck?)`

Runs the given `mapState` function against your store state, similar to
`mapStateToProps`. Unlike `mapStateToProps`, however, the result of your
`mapState` function is compared for reference equality (`===`) by default. To
use shallow equal comparison, pass in a comparision function as the second
parameter.

```tsx
const state = useMappedState(mapState);
```

You can use props or other component state in your `mapState` function. It must be memoized with `useCallback`, because `useMappedState` will infinitely recurse if you pass in a new mapState function every time.

```tsx
import {useMappedState} from 'redux-react-hook';

function TodoItem({index}) {
  // Note that we pass the index as a dependency parameter -- this causes
  // useCallback to return the same function every time unless index changes.
  const mapState = useCallback(state => state.todos[index], [index]);
  const todo = useMappedState(mapState);

  return <li>{todo}</li>;
}
```

If you don't have any inputs (the second argument to `useCallback`) pass an empty array `[]` so React uses the same function instance each render. You could also declare `mapState` outside of the function, but the React team does not recommend it, since the whole point of hooks is to allow you to keep everything in the component.

The second parameter to `useMappedState` is used to determine if a new result from the `mapState` function is the same as the previous result, in which case your component will not be re-rendered. Prior to v4.0.1, this was hard-coded to a shallow equality check. Starting in v4.0.1, `equalityCheck` defaults to reference equality (using `===`). To restore the old behavior, which is particularly useful when you are returning an object, you can use the [`shallowequal`](https://www.npmjs.com/package/shallowequal) module:

```tsx
import {useMappedState} from 'redux-react-hook';
import shallowEqual from 'shallowequal';

function TodoItem({index}) {
  // Note that we pass the index as a dependency parameter -- this causes
  // useCallback to return the same function every time unless index changes.
  const mapState = useCallback(
    state => ({
      todo: state.todos[index],
      totalCount: state.todos.length,
    }),
    [index],
  );
  const {todo, totalCount} = useMappedState(mapState, shallowEqual);

  return <li>{todo}</li>;
}
```

To avoid specifying the comparison function on every call to `useMappedState`, you can provide the defaultEqualityCheck option to [`create()`](#create). The `shallowEqual` function from [`fast-equals`](https://www.npmjs.com/package/fast-equals) is another good option, as it handles shallow comparisons of `Map`s and `Set`s as well as objects.

NOTE: Every call to `useMappedState` will subscribe to the store. If the store updates, though, your component will only re-render once. So, calling `useMappedState` more than once (for example encapsulated inside a custom hook) should not have a large performance impact. If your measurements show a performance impact, you can switch to returning an object instead.

### `useDispatch()`

Simply returns the dispatch method.

```tsx
import {useDispatch} from 'redux-react-hook';

function DeleteButton({index}) {
  const dispatch = useDispatch();
  const deleteTodo = useCallback(() => dispatch({type: 'delete todo', index}), [
    index,
  ]);

  return <button onClick={deleteTodo}>x</button>;
}
```

### `create(options?)`

Creates an instance of Redux React Hooks with a new `StoreContext`. The above functions are just exports of the default instance. You may want to create your own instance if:

1. You want better type safety without annotating every callsite. Creating your own instance ensures that the types are the same for all consumers. See the example for more info.
2. You want to provide a default implementation of `equalityCheck` for all calls to `mapState`
3. You have multiple Redux stores (this is not common)

```tsx
// MyStoreHooks.js

import {create} from 'redux-react-hook';

export const {StoreContext, useDispatch, useMappedState} = create();
```

```tsx
// MyStoreHooks.ts

import {create} from 'redux-react-hook';

// Example in TypeScript where you have defined IState and Action
export const {StoreContext, useDispatch, useMappedState} = create<
  IState,
  Action,
  Store<IState, Action>
>();
```

`create` takes an optional `options` object with the following options:

- `defaultEqualityCheck` - the default implementation of `equalityCheck` to use in `useMappedState`, defaults to refence equality (`===`)

To restore the pre v4.0.1 comparison behavior, for example:

```tsx
import {create} from 'redux-react-hook';
import shallowEqual from 'shallow-equal';

// Example in TypeScript where you have defined IState and Action
export const {StoreContext, useDispatch, useMappedState} = create<
  IState,
  Action,
  Store<IState, Action>
>({defaultEqualityCheck: shallowEqual});
```

## Example

You can try out `redux-react-hook` right in your browser with the [Codesandbox example](https://codesandbox.io/s/github/ianobermiller/redux-react-hook-example).

To run the example project locally:

```bash
# In one terminal, run `yarn start` in the root to rebuild the library itself
cd ./redux-react-example
yarn start

# In another terminal, run `yarn start` in the `example` folder
cd example
yarn start
```

## FAQ

### Is it typed with TypeScript/Flow?

One of the nice benefits of using hooks is that they are easier to type and less prone to trouble than higher-order components, especially when you are using multiple hooks (vs multiple HOCs). `redux-react-hook` comes with both [TypeScript definitions](https://github.com/facebookincubator/redux-react-hook/blob/master/src/index.d.ts) and [Flow types](https://github.com/facebookincubator/redux-react-hook/blob/master/src/index.js.flow), both of which should work out of the box when installing with npm/yarn.

### How does this compare to React Redux?

`redux-react-hook` has not been battle and perf-tested, so we don't recommend replacing [`react-redux`](https://github.com/reduxjs/react-redux) just yet. React Redux also guarantees that [data flows top down](https://medium.com/@kj_huang/implementation-of-react-redux-part-2-633441bd3306), so that child components update after their parents, which the hook does not.

### How do I fix the error "Too many re-renders. React limits the number of renders to prevent an infinite loop."

You're not memoizing the `mapState` function. Either declare it outside of your
stateless functional component or wrap it in `useCallback` to avoid creating a
new function every render.

### How can I use a selector creator, like in reselect?

If you want to [share a selector with props across multiple component instances](https://github.com/reduxjs/reselect#sharing-selectors-with-props-across-multiple-component-instances), create the selector in `useMemo` to ensure it has one copy per instance and use it directly in `useMappedState`.

```tsx
function TodoList({listID}) {
  // useMemo will execute the function makeGetVisibleTodos once per component
  const getVisibleTodos = useMemo(makeGetVisibleTodos, []);
  const todos = useMappedState(
    useCallback(
      // Note that you shouldn't pass the entire props list, since every time
      // useCallback is recreated, useMappedState will resubscribe
      state => getVisibleTodos(state, {listID}),
      [listID, getVisibleTodos],
    ),
  );
}
```

## Related projects

Here are some other projects that are adding hooks for Redux:

- [React Redux](https://react-redux.js.org/api/hooks) has hooks in version 7.1 and above
- [`use-substate`](https://github.com/philipp-spiess/use-substate)
- [`react-use-redux`](https://github.com/martynaskadisa/react-use-redux)
- [`react-use-dux`](https://github.com/richardpj/react-use-dux)
- [`react-use-redux-state`](https://github.com/pinyin/react-use-redux-state)

## Thanks

Special thanks to @sawyerhood and @sophiebits for writing most of the initial implementation! This repo was setup with the help of the excellent [`create-react-library`](https://www.npmjs.com/package/create-react-library).

## Contributing

Contributions are definitely welcome! Check out the [issues](https://github.com/facebookincubator/redux-react-hook/issues)
for ideas on where you can contribute. See the [CONTRIBUTING.md](CONTRIBUTING.md) file for more details.

## License

MIT © Facebook Inc.
