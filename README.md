# redux-react-hook

> React hook for accessing mapped state from a Redux store. Basically a hooks version of `react-redux`.

[![NPM](https://img.shields.io/npm/v/redux-react-hook.svg)](https://www.npmjs.com/package/redux-react-hook)

## Install

```bash
# Yarn
yarn add redux-react-hook

# NPM
npm install --save redux-react-hook
```

## Usage

All the hooks take a `storeContext` as the first parameter, which should be a
context object, the value returned by `React.createContext(...)`, that contains
your Redux store. See Custom Wrappers below to make this less cumbersome.

### Store in Context

Before you can use the hook, you must put your Redux store into `Context`:

```tsx
// Store.js

import {createStore} from 'redux';
import reducer from './reducer';

export function makeStore() {
  return createStore(reducer);
}

export const Context = React.createContext(null);
```

```tsx
// index.js

import {Context, makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <Context.Provider value={store}>
    <App />
  </Context.Provider>,
  document.getElementById('root'),
);
```

### `useMappedState(storeContext, mapState)`

Runs the given `mapState` function against your store state, just like
`mapStateToProps`.

```tsx
const state = useMappedState(storeContext, mapState);
```

If your `mapState` function doesn't use props or other component state,
declare it outside of your stateless functional component:

```tsx
import {useMappedState} from 'redux-react-hook';
import {Context} from './Store';

// Note how mapState is declared outside of the function -- this is critical, as
// useMappedState will infinitely recurse if you pass in a new mapState
// function every time.
const mapState = state => ({
  lastUpdated: state.lastUpdated,
  todoCount: state.todos.length,
});

export default function TodoSummary() {
  const {lastUpdated, todoCount} = useMappedState(Context, mapState);
  return (
    <div>
      <div>Count: {todoCount}</div>
      <div>Last updated: {new Date(lastUpdated).toString()}</div>
    </div>
  );
}
```

If you need to use props or other component state in your `mapState` function,
memoize the function with `useCallback`:

```tsx
import {useMappedState} from 'redux-react-hook';
import {Context} from './Store';

function TodoItem({index}) {
  // Note that we pass the index as a memoization parameter -- this causes
  // useCallback to return the same function every time unless index changes.
  const mapState = useCallback(state => state.todos[index], [index]);
  const todo = useMappedState(storeContext, mapState);

  return <li>{todo}</li>;
}
```

### `useDispatch(storeContext)`

Simply returns the dispatch method.

```tsx
import {useMappedState} from 'redux-react-hook';
import {Context} from './Store';

function DeleteButton({index}) {
  const dispatch = useDispatch(Context);
  const deleteTodo = useCallback(() => dispatch({type: 'delete todo', index}), [
    index,
  ]);

  return <button onClick={deleteTodo}>x</button>;
}
```

### Custom wrappers

To avoid having to pass in a `storeContext` with every call, we recommend adding
project specific wrappers for `useMappedState` and `useDispatch`:

```tsx
// Store.js

import {
  useDispatch as useDispatchGeneric,
  useMappedState as useMappedStateGeneric,
} from 'redux-react-hook';

export const Context = React.createContext(null);

export function useMappedState(mapState) {
  return useMappedStateGeneric(Context, mapState);
}

export function useDispatch() {
  return useDispatchGeneric(Context);
}
```

The `useMappedState` wrapper is also an ideal place to restrict the store state
that you want passed to `mapState`. For example, if your store schema has an
undo stack, and you only want to pass the current state.

```tsx
export function useMappedState(mapState) {
  const mapRestrictedState = useCallback(
    fullState => mapState(fullState.currentState),
    [mapState],
  );
  return useMappedStateGeneric(Context, mapRestrictedState);
}
```

See the example project for the full code.

## Example

To run the example project, a simple todo app:

```bash
cd example
yarn start
```

## FAQ

### How do I fix the error "Too many re-renders. React limits the number of renders to prevent an infinite loop."

You're not memoizing the `mapState` function. Either declare it outside of your
stateless functional component or wrap it in `useCallback` to avoid creating a
new function every render.

## Contributing

Contributions are definitely welcome! Check out the [issues](https://github.com/ianobermiller/redux-react-hook/issues)
for ideas on where you can contribute.

## License

MIT © [ianobermiller](https://github.com/ianobermiller)
