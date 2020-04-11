# Storeon Inferno

[![npm version](https://badge.fury.io/js/storeon-inferno.svg)](https://www.npmjs.com/package/storeon-inferno)
[![Build Status](https://travis-ci.org/distolma/storeon-inferno.svg?branch=master)](https://travis-ci.org/distolma/storeon-inferno)

<img src="https://storeon.github.io/storeon/logo.svg" align="right" alt="Storeon logo by Anton Lovchikov" width="160" height="142">

[Inferno] is the fast, React-like library for building high-performance user interfaces. `storeon-inferno` package helps to connect store with Inferno to provide a better performance and developer experience while remaining so tiny.

- **Size**. 377 bytes (+ Storeon itself) instead of ~10kB of [inferno-redux] (minified and gzipped).
- **Ecosystem**. Many additional [tools] can be combined with a store.
- **Speed**. It tracks what parts of state were changed and re-renders only components based on the changes.

[storeon]: https://github.com/storeon/storeon
[tools]: https://github.com/storeon/storeon#tools
[inferno]: https://github.com/infernojs/inferno
[inferno-redux]: https://github.com/infernojs/inferno/tree/master/packages/inferno-redux
[size limit]: https://github.com/ai/size-limit
[demo]: https://codesandbox.io/s/admiring-beaver-edi8m
[article]: https://evilmartians.com/chronicles/storeon-redux-in-173-bytes

## Install
```sh
npm install -S storeon-inferno
```
or
```sh
yarn add storeon-inferno
```
## How to use

Create store using `storeon` module:

#### `store.js`

```javascript
import { createStoreon } from 'storeon'

let counter = store => {
  store.on('@init', () => ({ count: 0 }))
  store.on('inc', ({ count }) => ({ count: count + 1 }))
}

export const store = createStoreon([counter])
```

#### `main.js`

Provide store using `StoreonProvider` from `storeon-inferno`:

```js
import { render } from 'inferno'
import { StoreonProvider } from 'storeon-inferno'
import { store } from './store'

render(
  <StoreonProvider store={store}>
    <App />
  </StoreonProvider>,
  document.body
)
```

Import `connectStoreon` decorator from `storeon-inferno`:

#### `Counter.js`

```js
import { connectStoreon } from 'storeon-inferno'

const Counter = ({ count, dispatch }) => {
  return (
    <div>
      {count}
      <button onClick={() => dispatch('inc')}>inc</button>
    </div>
  )
}
export default connectStoreon('count', Counter)
```
