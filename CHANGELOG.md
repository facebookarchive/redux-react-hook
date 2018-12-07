# Changelog for redux-react-hook

## v3.0.0

Dec 6, 2018

- Breaking Change: Export `StoreContext` instead of just `StoreProvider` to allow access to the store in context outside of `redux-react-hook`. To update, replace imports of `StoreProvider` with `StoreContext` and usage of `<StoreProvider>` with `<StoreContext.Provider>`

## v2.0.0

Oct 30, 2018

- Breaking Change: Export `StoreProvider` instead of requiring you to pass in context

## v1.0.0

Oct 25, 2018

- Initial release
