# [each-promise][author-www-url] [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] [![npm downloads][downloads-img]][downloads-url] 

> Iterate over promises, promise-returning or async/await functions in series or parallel. Support settle (fail-fast), concurrency (limiting) and hooks system (start, beforeEach, afterEach, finish)

[![code climate][codeclimate-img]][codeclimate-url] [![standard code style][standard-img]][standard-url] [![travis build status][travis-img]][travis-url] [![coverage status][coveralls-img]][coveralls-url] [![dependency status][david-img]][david-url]

## Install
> Install with [npm](https://www.npmjs.com/)

```sh
$ npm i each-promise --save
```

## Usage
> For more use-cases see the [tests](./test.js)

```js
const eachPromise = require('each-promise')
```

## API

### [.serial/.series](index.js#L26)

> Iterate over `iterable` in series (serially)
with optional `options` (see [options section](#options))
and optional `mapper` function (see [mapper section](#mapper)).

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to map over values, see [mapper section](#mapper)    
* `[options]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**  

### [.parallel](index.js#L44)

> Iterate over `iterable` in parallel (support limiting with `options.concurrency`)
with optional `options` (see [options section](#options))
and optional `mapper` function (see [mapper section](#mapper)).

**Params**

* `<iterable>` **{Array|Object}**: iterable object like array or object with any type of values    
* `[mapper]` **{Function}**: function to map over values, see [mapper section](#mapper)    
* `[options]` **{Object}**: see [options section](#options)    
* `returns` **{Promise}**  

## Options
> You have control over everything, through options.

* `Promise` **{Function}**: custom Promise constructor to be used, defaults to native
* `mapper` **{Function}**: see [mapper section](#mapper)
* `settle` **{Boolean}**: if `false` stops after first error (also known as _"fail-fast"_ or _"bail"_), default `true`
* `flat` **{Boolean}**: result array to contain only values, default `true`
* `concurrency` **{Number}**: works only with `.parallel` method, defaults to `iterable` length
* `start` **{Function}**: on start hook, called once at the begining of iteration
* `beforeEach` **{Function}**: called before each item in `iterable`,
  + passed with `item, index, arr` arguments
  + where `item.value` may be resolved/rejected value **or function**
  + may `item.reason` exists with error object, if exists then `item.value` not exists
  + where `item.index` is number, order
* `afterEach` **{Function}**: called after each item in `iterable`
  + passed with `item, index, arr` arguments
  + where `item.value` may be resolved/rejected value
  + may `item.reason` exists with error object, if exists then `item.value` not exists
  + where `item.index` is number, order
* `finish` **{Function}**: called at the end of iteration, passed with `err, result` arguments, where the `result` can be one of:
  + array of resolved/rejected values
  + array of `item` objects if `flat: false`
  + array of what you returned from `mapper` function

## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/each-promise/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.

## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckoCore.tk][author-www-img]][author-www-url] [![keybase tunnckoCore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]

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

