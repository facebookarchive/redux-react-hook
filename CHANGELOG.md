# Changelog for redux-react-hook

## v4.0.1

Nov 25, 2019

- Published without rebasing with new changes. Doh.

## v4.0.0

Nov 25, 2019

- Breaking Change: the default comparision for the return value of mapState has changed from shallow equality to reference equality. To restore the old behavior, pass a shallow equal comparison function to `create` (e.g. `create({defaultEqualityCheck: shallowEqual})`). The [`shallowequal`](https://www.npmjs.com/package/shallowequal) module is equivalent.

## v3.4.0

Oct 15, 2019

- useLayoutEffect to avoid unnecessary renders (thanks @goloveychuk!), fixing #73

## v3.3.2

Apr 29, 2019

- TypeScript types: allow custom dispatch type (thanks @zebrallel)
- Flow types: clean up after actual usage

## v3.3.1

Apr 8, 2019

- Don't resubscribe if `mapState` changes (thanks @Turanchoks)

## v3.3.0

Apr 5, 2019

- Simplify implementation, avoiding stale reads (thanks @Turanchoks!)
- Remove `prop-type` as a `peerDependency`
- Hand role TypeScript types to work around issues with create-react-app
- Add Flow types to distributed build

## v3.2.1

Mar 13, 2019

- Remove react-dom as a peerDependency

## v3.2.0

Feb 21, 2019

- Avoid double render if new mapState returns same mappedState (thanks @Turanchoks!)
- Add create function for better typing (thanks @nmn!)

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
