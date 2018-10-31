# redux-react-hook

> React hook for accessing mapped state from a Redux store.

[![NPM](https://img.shields.io/npm/v/redux-react-hook.svg)](https://www.npmjs.com/package/redux-react-hook)
[![Bundle Size](https://badgen.net/bundlephobia/minzip/redux-react-hook)](https://bundlephobia.com/result?p=redux-react-hook)

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

Before you can use the hook, you must provide your Redux store via `StoreProvider`:

```tsx
// Store.js

import {createStore} from 'redux';
import reducer from './reducer';

export function makeStore() {
  return createStore(reducer);
}
```

```tsx
// index.js

import {StoreProvider} from 'redux-react-hook';
import {makeStore} from './Store';

const store = makeStore();

ReactDOM.render(
  <StoreProvider value={store}>
    <App />
  </StoreProvider>,
  document.getElementById('root'),
);
```

### `useMappedState(mapState)`

Runs the given `mapState` function against your store state, just like
`mapStateToProps`.

```tsx
const state = useMappedState(mapState);
```

If your `mapState` function doesn't use props or other component state,
declare it outside of your stateless functional component:

```tsx
import {useMappedState} from 'redux-react-hook';

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

function TodoItem({index}) {
  // Note that we pass the index as a memoization parameter -- this causes
  // useCallback to return the same function every time unless index changes.
  const mapState = useCallback(state => state.todos[index], [index]);
  const todo = useMappedState(mapState);

  return <li>{todo}</li>;
}
```

### `useDispatch(storeContext)`

Simply returns the dispatch method.

```tsx
import {useMappedState} from 'redux-react-hook';

function DeleteButton({index}) {
  const dispatch = useDispatch(Context);
  const deleteTodo = useCallback(() => dispatch({type: 'delete todo', index}), [
    index,
  ]);

  return <button onClick={deleteTodo}>x</button>;
}
```

## Example

To run the example project, a simple todo app:

```bash
# In one terminal, run `yarn start` in the root to rebuild the library itself
cd ./redux-react-example
yarn start

# In another terminal, run `yarn start` in the `example` folder
cd example
yarn start
```

## FAQ

### How do I fix the error "Too many re-renders. React limits the number of renders to prevent an infinite loop."

You're not memoizing the `mapState` function. Either declare it outside of your
stateless functional component or wrap it in `useCallback` to avoid creating a
new function every render.

## Alternatives

Hooks are really new, and we are just beginning to see what people do with them. There is an [open issue on `react-redux`](https://github.com/reduxjs/react-redux/issues/1063) discussing the potential. Here are some other projects that are adding hooks for Redux:

- [`use-substate`](https://github.com/philipp-spiess/use-substate)
- [`react-use-redux`](https://github.com/martynaskadisa/react-use-redux)

## Thanks

Special thanks to @sawyerhood and @sophiebits for writing most of the hook! This repo was setup with the help of the excellent [`create-react-library`](https://www.npmjs.com/package/create-react-library).

## Contributing

Contributions are definitely welcome! Check out the [issues](https://github.com/ianobermiller/redux-react-hook/issues)
for ideas on where you can contribute.

## License

MIT © Facebook Inc.
