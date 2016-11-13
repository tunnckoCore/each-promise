# [each-promise][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Iterate over promises, promise-returning or async/await functions in series or parallel. Support settle (fail-fast), concurrency (limiting) and hooks system (start, beforeEach, afterEach, finish)

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [Background](#background)
  * [Why not "promise fun"?](#why-not-promise-fun)
  * [Why not separate libs?](#why-not-separate-libs)
- [API](#api)
  * [.serial](#serial)
  * [.parallel](#parallel)
  * [.each](#each)
- [Options](#options)
- [Hooks](#hooks)
- [Item](#item)
- [Finish hook](#finish-hook)
- [Related](#related)
- [Contributing](#contributing)

## Install
> Install with [npm](https://www.npmjs.com/)

```sh
$ npm i each-promise --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
const eachPromise = require('each-promise')
const arr = [
  123,
  'foo',
  () => 456,
  Promise.resolve(567)
  false,
  () => Promise.resolve(11)
]

eachPromise.serial(arr).then((res) => {
  console.log(res) // => [123, 'foo', 456, 567, false, 11]
})
```

## Background
You may think why this exists, what is this for, why not Sindre's microlibs like [p-map][], [p-map-series][], [p-settle][], [p-each-series][] or [p-reduce][].

### Why not "promise fun"?
They do their jobs okey, but in some cases they don't. And that's the my case. I need control over _"fast fail"_ behavior, also known as _"settle"_ or _"bail"_. I need serial and parallel iteration, but parallel with concurrency too. They requires node v4, and uses native Promise constructor. I believe in that we should not use modern things if we don't need them, it is just syntax sugar. This package is written in way that works in node versions below v4 and also you can pass custom Promise constructor through [options.Promise](#options) if you want.

- :negative_squared_cross_mark: node@4 required
- :negative_squared_cross_mark: hooks system
- :negative_squared_cross_mark: settle / fail-fast / bail
- :negative_squared_cross_mark: custom Promise
- :negative_squared_cross_mark: no real and meaningful tests
- :white_check_mark: concurrency control

**[back to top](#readme)**

### Why not separate libs?
Why not separate `.serial` and `.parallel` into own libs like Sindre did? Because the main core logic and difference is absolutely in just 2-3 lines of code and one `if` check. The main thing is that `parallel` uses `for` loop with `concurrency` combination, and `series` does not use loops, but recursive function calls.

For free you get hooks system. And really it cost nothing. It just able to be done, because the structure of the code and because I need such thing.

- :white_check_mark: node v0.10 and above
- :white_check_mark: custom Promise constructor
- :white_check_mark: real settle / fail fast
- :white_check_mark: hook system, through options
- :white_check_mark: very stable and well tested with real tests
- :white_check_mark: concurrency control

**[back to top](#readme)**

## API

### [.serial](index.js#L57)
> Iterate over `iterable` in series (serially) with optional `opts` (see [options section](#options)) and optional `mapper` function (see [item section](#item)).

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**  

**Example**

```js
var delay = require('delay')
var eachPromise = require('each-promise')

var arr = [
  () => delay(500).then(() => 1),
  () => delay(200).then(() => { throw Error('foo') }),
  () => delay(10).then(() => 3),
  () => delay(350).then(() => 4),
  () => delay(150).then(() => 5)
]

eachPromise.serial(arr)
.then((res) => {
  console.log(res) // [1, Error: foo, 3, 4, 5]
})

// see what happens when parallel
eachPromise.parallel(arr)
.then((res) => {
  console.log(res) // => [3, 5, Error: foo, 4, 1]
})

// pass `settle: false` if you want
// to stop after first error
eachPromise.serial(arr, { settle: false })
.catch((err) => console.log(err)) // => Error: foo
```

### [.parallel](index.js#L139)
> Iterate concurrently over `iterable` in parallel (support limiting with `opts.concurrency`) with optional `opts` (see [options section](#options)) and optional `mapper` function (see [item section](#item)).

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**  

**Example**

```js
var eachPromise = require('each-promise')

var arr = [
  function one () {
    return delay(200).then(() => {
      return 123
    })
  },
  Promise.resolve('foobar'),
  function two () {
    return delay(1500).then(() => {
      return 345
    })
  },
  delay(10).then(() => 'zero'),
  function three () {
    return delay(400).then(() => {
      coffffnsole.log(3) // eslint-disable-line no-undef
      return 567
    })
  },
  'abc',
  function four () {
    return delay(250).then(() => {
      return 789
    })
  },
  function five () {
    return delay(100).then(() => {
      sasasa // eslint-disable-line no-undef
      return 444
    })
  },
  function six () {
    return delay(80).then(() => {
      return 'last'
    })
  }
]

// does not stop after first error
// pass `settle: false` if you want
eachPromise.parallel(arr).then((res) => {
  console.log(res)
  // => [
  //   'foobar',
  //   'abc',
  //   'zero',
  //   'last',
  //   ReferenceError: sasasa is not defined,
  //   123,
  //   789,
  //   ReferenceError: coffffnsole is not defined
  //   345
  // ]
})
```

### [.each](index.js#L185)
> Iterate over `iterable` in series or parallel (default), depending on default `opts`. Pass `opts.serial: true` if you want to iterate in series, pass `opts.serial: false` or does not pass anything for parallel.

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**  

**Example**

```js
var delay = require('delay')
var eachPromise = require('each-promise')

var promise = eachPromise.each([
  123,
  function () {
    return delay(500).then(() => 456)
  },
  Promise.resolve(678),
  function () {
    return 999
  },
  function () {
    return delay(200).then(() => 'foo')
  }
])

promise.then(function (res) {
  console.log('done', res) // => [123, 678, 999, 'foo', 456]
})
```

## Options
> You have control over everything, through options.

* `Promise` **{Function}**: custom Promise constructor to be used, defaults to native
* `mapper` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)
* `settle` **{Boolean}**: if `false` stops after first error (also known as _"fail-fast"_ or _"bail"_), default `true`
* `flat` **{Boolean}**: result array to contain only values, default `true`
* `concurrency` **{Number}**: works only with `.parallel` method, defaults to `iterable` length
* `start` **{Function}**: on start hook, see [hooks section](#hooks)
* `beforeEach` **{Function}**: called before each item in `iterable`, see [hooks section](#hooks)
* `afterEach` **{Function}**: called after each item in `iterable`, see [hooks section](#hooks)
* `finish` **{Function}**: called at the end of iteration, see [hooks section](#hooks)

**[back to top](#readme)**

## Hooks
> You can do what you want between stages through hooks - start, before each, after each, finish.

* `start` **{Function}**: called at the start of iteration, before anything
* `beforeEach` **{Function}**: passed with `item, index, arr` arguments
  + `item` is an object with `value`, `reason` and `index` properties, see [item section](#item)
  + `index` is the same as `item.index`
  + `arr` is the iterable object - array or object
* `afterEach` **{Function}**: passed with `item, index, arr` arguments
  + `item` is an object with `value`, `reason` and `index` properties, see [item section](#item)
  + `index` is the same as `item.index`
  + `arr` is the iterable object - array or object
* `finish` **{Function}**: called at the end of iteration, see [finish hook section](#finish-hook)

**[back to top](#readme)**

## Item
> That object is special object, that is passed to `beforeEach` and `afterEach` hooks, also can be found in `result` object if you pass `opts.flat: false` option. And passed to `opts.mapper` function too.

* `item.value` resolved/rejected promise value, if at `beforeEach` hook it can be `function`
* `item.reason` may not exist if `item.value`, if exist it is standard Error object
* `item.index` is number, order of "executing", not the order that is defined in `iterable`

**[back to top](#readme)**

## Finish hook
> This hooks is called when everything is finished / completed. At the very end of iteration. It is passed with `err, result` arguments where:

* `err` is an Error object, if `opts.settle: false`, otherwise `null`
* `result` is always an array with values or [item objects](#item) if `opts.flat: false`

**[back to top](#readme)**

## Related
- [always-done](https://www.npmjs.com/package/always-done): Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A… [more](https://github.com/hybridables/always-done#readme) | [homepage](https://github.com/hybridables/always-done#readme "Handle completion and errors with elegance! Support for streams, callbacks, promises, child processes, async/await and sync functions. A drop-in replacement for [async-done][] - pass 100% of its tests plus more")
- [minibase-create-plugin](https://www.npmjs.com/package/minibase-create-plugin): Utility for [minibase][] and [base][] that helps you create plugins | [homepage](https://github.com/node-minibase/minibase-create-plugin#readme "Utility for [minibase][] and [base][] that helps you create plugins")
- [minibase-is-registered](https://www.npmjs.com/package/minibase-is-registered): Plugin for [minibase][] and [base][], that adds `isRegistered` method to your application to detect if plugin is already… [more](https://github.com/node-minibase/minibase-is-registered#readme) | [homepage](https://github.com/node-minibase/minibase-is-registered#readme "Plugin for [minibase][] and [base][], that adds `isRegistered` method to your application to detect if plugin is already registered and returns true or false if named plugin is already registered on the instance.")
- [minibase](https://www.npmjs.com/package/minibase): MiniBase is minimalist approach to Base - @node-base, the awesome framework. Foundation for building complex APIs with small… [more](https://github.com/node-minibase/minibase#readme) | [homepage](https://github.com/node-minibase/minibase#readme "MiniBase is minimalist approach to Base - @node-base, the awesome framework. Foundation for building complex APIs with small units called plugins. Works well with most of the already existing [base][] plugins.")
- [mukla](https://www.npmjs.com/package/mukla): Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works… [more](https://github.com/tunnckocore/mukla#readme) | [homepage](https://github.com/tunnckocore/mukla#readme "Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works at node.js v0.10 and above.")
- [try-catch-callback](https://www.npmjs.com/package/try-catch-callback): try/catch block with a callback, used in [try-catch-core][]. Use it when you don't care about asyncness so much… [more](https://github.com/hybridables/try-catch-callback#readme) | [homepage](https://github.com/hybridables/try-catch-callback#readme "try/catch block with a callback, used in [try-catch-core][]. Use it when you don't care about asyncness so much and don't want guarantees. If you care use [try-catch-core][].")
- [try-catch-core](https://www.npmjs.com/package/try-catch-core): Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful… [more](https://github.com/hybridables/try-catch-core#readme) | [homepage](https://github.com/hybridables/try-catch-core#readme "Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and used in higher-level libs such as [always-done][] to handle completion of anything.")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/each-promise/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

[always-done]: https://github.com/hybridables/always-done
[async-done]: https://github.com/gulpjs/async-done
[base]: https://github.com/node-base/base
[dezalgo]: https://github.com/npm/dezalgo
[minibase]: https://github.com/node-minibase/minibase
[once]: https://github.com/isaacs/once
[p-each-series]: https://github.com/sindresorhus/p-each-series
[p-map-series]: https://github.com/sindresorhus/p-map-series
[p-map]: https://github.com/sindresorhus/p-map
[p-reduce]: https://github.com/sindresorhus/p-reduce
[p-settle]: https://github.com/sindresorhus/p-settle
[try-catch-core]: https://github.com/hybridables/try-catch-core

[npmjs-url]: https://www.npmjs.com/package/each-promise
[npmjs-img]: https://img.shields.io/npm/v/each-promise.svg?label=each-promise

[license-url]: https://github.com/tunnckoCore/each-promise/blob/master/LICENSE
[license-img]: https://img.shields.io/npm/l/each-promise.svg

[downloads-url]: https://www.npmjs.com/package/each-promise
[downloads-img]: https://img.shields.io/npm/dm/each-promise.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/each-promise
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/each-promise.svg

[travis-url]: https://travis-ci.org/tunnckoCore/each-promise
[travis-img]: https://img.shields.io/travis/tunnckoCore/each-promise/master.svg

[coveralls-url]: https://coveralls.io/r/tunnckoCore/each-promise
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/each-promise.svg

[david-url]: https://david-dm.org/tunnckoCore/each-promise
[david-img]: https://img.shields.io/david/tunnckoCore/each-promise.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/ama
[new-message-img]: https://img.shields.io/badge/ask%20me-anything-green.svg

