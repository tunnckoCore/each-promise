<h1 align="center">each-promise
  <a href="https://www.npmjs.com/package/each-promise"><img src="https://img.shields.io/npm/v/each-promise.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/each-promise"><img src="https://img.shields.io/npm/l/each-promise.svg" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/each-promise"><img src="https://img.shields.io/npm/dm/each-promise.svg" alt="npm downloads monthly"></a>
  <a href="https://www.npmjs.com/package/each-promise"><img src="https://img.shields.io/npm/dt/each-promise.svg" alt="npm downloads total"></a>
  <br>
<img src="https://cdn.jsdelivr.net/emojione/assets/svg/1f300.svg" width="256" height="256" alt="Each Promise - Async control flow library"><br>
Asynchronous control flow library
</h1>

> Iterate over promises, promise-returning or async/await functions in series or parallel. Support settle (fail-fast), concurrency (limiting) and hooks system (start, beforeEach, afterEach, finish)

[![codeclimate][codeclimate-img]][codeclimate-url] 
[![codestyle][standard-img]][standard-url] 
[![linux build][travis-img]][travis-url] 
[![windows build][appveyor-img]][appveyor-url] 
[![codecov][coverage-img]][coverage-url] 
[![dependency status][david-img]][david-url]

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
- [Building docs](#building-docs)
- [Running tests](#running-tests)
- [Author](#author)
- [Logo](#logo)
- [License](#license)

_(TOC generated by [verb](https://github.com/verbose/verb) using [markdown-toc](https://github.com/jonschlinkert/markdown-toc))_

## Install
Install with [npm](https://www.npmjs.com/)

```
$ npm install each-promise --save
```

or install using [yarn](https://yarnpkg.com)

```
$ yarn add each-promise
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

eachPromise
  .serial(arr)
  .then((res) => {
    console.log(res) // => [123, 'foo', 456, 567, false, 11]
  })
```

## Background
You may think why this exists, what is this for, why not Sindre's microlibs like [p-map][], [p-map-series][], [p-settle][], [p-each-series][] or [p-reduce][].

### Why not "promise fun"?
They do their jobs okey, but in some cases they don't. And that's the my case. I need control over _"fast fail"_ behavior, also known as _"settle"_ or _"bail"_. I need serial and parallel iteration, but parallel with concurrency too. They requires node v4, and uses native Promise constructor. I believe in that we should not use modern things if we don't need them, it is just syntax sugar. This package is written in way that works in node versions below v4 and also you can pass custom Promise constructor through [options.Promise](#options) if you want.

- node@4 required
- no hooks system
- no settle / fail-fast / bail
- no custom Promise
- no real and meaningful tests
- concurrency control

**[back to top](#readme)**

### Why not separate libs?
Why not separate `.serial` and `.parallel` into own libs like Sindre did? Because the main core logic and difference is absolutely in just 2-3 lines of code and one `if` check. The main thing is that `parallel` uses `for` loop with `concurrency` combination, and `series` does not use loops, but recursive function calls.

For free you get hooks system. And really it cost nothing. It just able to be done, because the structure of the code and because I need such thing.

- node v0.10 and above
- custom Promise constructor
- real settle / fail fast
- hook system, through options
- very stable and well tested with real tests
- concurrency control

**[back to top](#readme)**

## API

### [.serial](index.js#L68)
> Iterate over `iterable` in series (serially) with optional `opts` (see [options section](#options)) and optional `mapper` function (see [item section](#item)).

**Note:** It may throw **in one VERY** specific case! That case is
when **invalid** `iterable` is passed AND no opts.Promise
AND no native Promise support! Otherwise **ALWAYS** returns rejected promise:
1) if node >= 0.11.13 with native Promise - return rejected promise;
2) if node >= 0.11.13 with opts.Promise - return rejected promise;
3) if node < 0.11.13, but opts.Promise - return rejected promise;

**Params**

* `<iterable>` **{Array}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**: Always resolved or rejected promise  

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

eachPromise
  .serial(arr)
  .then((res) => {
    console.log(res) // [1, Error: foo, 3, 4, 5]
  })

// see what happens when parallel
eachPromise
  .parallel(arr)
  .then((res) => {
    console.log(res) // => [3, 5, Error: foo, 4, 1]
  })

// pass `settle: false` if you want
// to stop after first error
eachPromise
  .serial(arr, { settle: false })
  .catch((err) => console.log(err)) // => Error: foo
```

### [.parallel](index.js#L159)
> Iterate concurrently over `iterable` in parallel (support limiting with `opts.concurrency`) with optional `opts` (see [options section](#options)) and optional `mapper` function (see [item section](#item)).

**Note:** It may throw **in one VERY** specific case! That case is
when **invalid** `iterable` is passed AND no opts.Promise
AND no native Promise support! Otherwise **ALWAYS** returns rejected promise:
1) if node >= 0.11.13 with native Promise - return rejected promise;
2) if node >= 0.11.13 with opts.Promise - return rejected promise;
3) if node < 0.11.13, but opts.Promise - return rejected promise;

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**: Always resolved or rejected promise  

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
eachPromise
  .parallel(arr)
  .then((res) => {
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

### [.each](index.js#L214)
> Iterate over `iterable` in series or parallel (default), depending on default `opts`. Pass `opts.serial: true` if you want to iterate in series, pass `opts.serial: false` or does not pass anything for parallel.

**Note:** It may throw **in one VERY** specific case! That case is
when **invalid** `iterable` is passed AND no opts.Promise
AND no native Promise support! Otherwise **ALWAYS** returns rejected promise:
1) if node >= 0.11.13 with native Promise - return rejected promise;
2) if node >= 0.11.13 with opts.Promise - return rejected promise;
3) if node < 0.11.13, but opts.Promise - return rejected promise;

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to apply to each item in `iterable`, see [item section](#item)    
* `[opts]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**: Always resolved or rejected promise  

**Example**

```js
var delay = require('delay')
var eachPromise = require('each-promise')

var arr = [
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
]

eachPromise
  .each(arr)
  .then(function (res) {
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
* `context` **{Object}**: custom context to be passed to each `fn` in `iterable`
* `args` **{Array}**: custom argument(s) to be pass to `fn`, given value is arrayified

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
- [minibase](https://www.npmjs.com/package/minibase): Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the… [more](https://github.com/node-minibase/minibase#readme) | [homepage](https://github.com/node-minibase/minibase#readme "Minimalist alternative for Base. Build complex APIs with small units called plugins. Works well with most of the already existing [base][] plugins.")
- [mukla](https://www.npmjs.com/package/mukla): Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works… [more](https://github.com/tunnckocore/mukla#readme) | [homepage](https://github.com/tunnckocore/mukla#readme "Small, parallel and fast test framework with suppport for async/await, promises, callbacks, streams and observables. Targets and works at node.js v0.10 and above.")
- [try-catch-callback](https://www.npmjs.com/package/try-catch-callback): try/catch block with a callback, used in [try-catch-core][]. Use it when you don't care about asyncness so much… [more](https://github.com/hybridables/try-catch-callback#readme) | [homepage](https://github.com/hybridables/try-catch-callback#readme "try/catch block with a callback, used in [try-catch-core][]. Use it when you don't care about asyncness so much and don't want guarantees. If you care use [try-catch-core][].")
- [try-catch-core](https://www.npmjs.com/package/try-catch-core): Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful… [more](https://github.com/hybridables/try-catch-core#readme) | [homepage](https://github.com/hybridables/try-catch-core#readme "Low-level package to handle completion and errors of sync or asynchronous functions, using [once][] and [dezalgo][] libs. Useful for and used in higher-level libs such as [always-done][] to handle completion of anything.")

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/each-promise/issues/new).  
Please read the [contributing guidelines](CONTRIBUTING.md) for advice on opening issues, pull requests, and coding standards.  
If you need some help and can spent some cash, feel free to [contact me at CodeMentor.io](https://www.codementor.io/tunnckocore?utm_source=github&utm_medium=button&utm_term=tunnckocore&utm_campaign=github) too.

**In short:** If you want to contribute to that project, please follow these things

1. Please DO NOT edit [README.md](README.md), [CHANGELOG.md](CHANGELOG.md) and [.verb.md](.verb.md) files. See ["Building docs"](#building-docs) section.
2. Ensure anything is okey by installing the dependencies and run the tests. See ["Running tests"](#running-tests) section.
3. Always use `npm run commit` to commit changes instead of `git commit`, because it is interactive and user-friendly. It uses [commitizen][] behind the scenes, which follows Conventional Changelog idealogy.
4. Do NOT bump the version in package.json. For that we use `npm run release`, which is [standard-version][] and follows Conventional Changelog idealogy.

Thanks a lot! :)

## Building docs
Documentation and that readme is generated using [verb-generate-readme][], which is a [verb][] generator, so you need to install both of them and then run `verb` command like that

```
$ npm install verbose/verb#dev verb-generate-readme --global && verb
```

_Please don't edit the README directly. Any changes to the readme must be made in [.verb.md](.verb.md)._

## Running tests
Clone repository and run the following in that cloned directory

```
$ npm install && npm test
```

## Author
**Charlike Mike Reagent**

+ [github/tunnckoCore](https://github.com/tunnckoCore)
+ [twitter/tunnckoCore](https://twitter.com/tunnckoCore)
+ [codementor/tunnckoCore](https://codementor.io/tunnckoCore)

## Logo
The logo is [Cyclone Emoji](https://cdn.jsdelivr.net/emojione/assets/svg/1f300.svg) from [EmojiOne.com](http://emojione.com/). Released under the [CC BY 4.0](http://emojione.com/licensing/) license.

## License
Copyright © 2016-2017, [Charlike Mike Reagent](http://www.tunnckocore.tk). Released under the [MIT License](LICENSE).

***

_This file was generated by [verb-generate-readme](https://github.com/verbose/verb-generate-readme), v0.4.3, on March 19, 2017._  
_Project scaffolded using [charlike][] cli._

[always-done]: https://github.com/hybridables/always-done
[async-done]: https://github.com/gulpjs/async-done
[base]: https://github.com/node-base/base
[charlike]: https://github.com/tunnckocore/charlike
[commitizen]: https://github.com/commitizen/cz-cli
[dezalgo]: https://github.com/npm/dezalgo
[minibase]: https://github.com/node-minibase/minibase
[once]: https://github.com/isaacs/once
[p-each-series]: https://github.com/sindresorhus/p-each-series
[p-map-series]: https://github.com/sindresorhus/p-map-series
[p-map]: https://github.com/sindresorhus/p-map
[p-reduce]: https://github.com/sindresorhus/p-reduce
[p-settle]: https://github.com/sindresorhus/p-settle
[standard-version]: https://github.com/conventional-changelog/standard-version
[try-catch-core]: https://github.com/hybridables/try-catch-core
[verb-generate-readme]: https://github.com/verbose/verb-generate-readme
[verb]: https://github.com/verbose/verb

[downloads-url]: https://www.npmjs.com/package/each-promise
[downloads-img]: https://img.shields.io/npm/dt/each-promise.svg

[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/each-promise
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/each-promise.svg

[travis-url]: https://travis-ci.org/tunnckoCore/each-promise
[travis-img]: https://img.shields.io/travis/tunnckoCore/each-promise/master.svg?label=linux

[appveyor-url]: https://ci.appveyor.com/project/tunnckoCore/each-promise
[appveyor-img]: https://img.shields.io/appveyor/ci/tunnckoCore/each-promise/master.svg?label=windows

[coverage-url]: https://codecov.io/gh/tunnckoCore/each-promise
[coverage-img]: https://img.shields.io/codecov/c/github/tunnckoCore/each-promise/master.svg

[david-url]: https://david-dm.org/tunnckoCore/each-promise
[david-img]: https://img.shields.io/david/tunnckoCore/each-promise.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg

