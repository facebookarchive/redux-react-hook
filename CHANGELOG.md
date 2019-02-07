# Changelog for redux-react-hook

## v3.1.0

Feb 6, 2019

- Update React dependency to 16.8.1, the one with hooks
- Update all other dependencies to the latest

## v3.0.4

Feb 1, 2019

- Bug fix: don't set state after unsubscribing from Redux (thanks @gaearon!)

## v3.0.3

Jan 28, 2019

- Move react-scripts and @types/node to devDependencies (thanks @stevenla)

## v3.0.2

Jan 20, 2019

- Add types field to package.json (thanks @Mrtenz!)
- Docs update to not condemn multiple useMappedState calls

## v3.0.1

Dec 26, 2018

- Update docs and tests

## v3.0.0

Dec 6, 2018

- Breaking Change: Export `StoreContext` instead of just `StoreProvider` to allow access to the store in context outside of `redux-react-hook`. To update, replace imports of `StoreProvider` with `StoreContext` and usage of `<StoreProvider>` with `<StoreContext.Provider>`

## v2.0.0

Oct 30, 2018

- Breaking Change: Export `StoreProvider` instead of requiring you to pass in context

## v1.0.0

Oct 25, 2018

- Initial release
