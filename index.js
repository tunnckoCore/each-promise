/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var Promize = require('native-or-another')
var utils = require('./utils')
var eachPromise = {}

/**
 * > Iterate over `iterable` in series (serially)
 * with optional `opts` (see [options section](#options))
 * and optional `mapper` function (see [item section](#item)).
 *
 * **Example**
 *
 * ```js
 * var delay = require('delay')
 * var eachPromise = require('each-promise')
 *
 * var arr = [
 *   () => delay(500).then(() => 1),
 *   () => delay(200).then(() => { throw Error('foo') }),
 *   () => delay(10).then(() => 3),
 *   () => delay(350).then(() => 4),
 *   () => delay(150).then(() => 5)
 * ]
 *
 * eachPromise
 *   .serial(arr)
 *   .then((res) => {
 *     console.log(res) // [1, Error: foo, 3, 4, 5]
 *   })
 *
 * // see what happens when parallel
 * eachPromise
 *   .parallel(arr)
 *   .then((res) => {
 *     console.log(res) // => [3, 5, Error: foo, 4, 1]
 *   })
 *
 * // pass `settle: false` if you want
 * // to stop after first error
 * eachPromise
 *   .serial(arr, { settle: false })
 *   .catch((err) => console.log(err)) // => Error: foo
 * ```
 *
 * @name   .serial
 * @param  {Array} `<iterable>` iterable object like array with any type of values
 * @param  {Function} `[mapper]` function to apply to each item in `iterable`, see [item section](#item)
 * @param  {Object} `[opts]` see [options section](#options)
 * @return {Promise} Always resolved or rejected promise
 * @api public
 */

eachPromise.serial = function eachSerial (iterable, mapper, opts) {
  var options = utils.defaults(mapper, opts)
  options = utils.extend(options, {
    serial: true
  })
  return eachPromise.each(iterable, options.mapper, options)
}

/**
 * > Iterate concurrently over `iterable` in parallel (support limiting with `opts.concurrency`)
 * with optional `opts` (see [options section](#options))
 * and optional `mapper` function (see [item section](#item)).
 *
 * **Example**
 *
 * ```js
 * var eachPromise = require('each-promise')
 *
 * var arr = [
 *   function one () {
 *     return delay(200).then(() => {
 *       return 123
 *     })
 *   },
 *   Promise.resolve('foobar'),
 *   function two () {
 *     return delay(1500).then(() => {
 *       return 345
 *     })
 *   },
 *   delay(10).then(() => 'zero'),
 *   function three () {
 *     return delay(400).then(() => {
 *       coffffnsole.log(3) // eslint-disable-line no-undef
 *       return 567
 *     })
 *   },
 *   'abc',
 *   function four () {
 *     return delay(250).then(() => {
 *       return 789
 *     })
 *   },
 *   function five () {
 *     return delay(100).then(() => {
 *       sasasa // eslint-disable-line no-undef
 *       return 444
 *     })
 *   },
 *   function six () {
 *     return delay(80).then(() => {
 *       return 'last'
 *     })
 *   }
 * ]
 *
 * // does not stop after first error
 * // pass `settle: false` if you want
 * eachPromise
 *   .parallel(arr)
 *   .then((res) => {
 *     console.log(res)
 *     // => [
 *     //   'foobar',
 *     //   'abc',
 *     //   'zero',
 *     //   'last',
 *     //   ReferenceError: sasasa is not defined,
 *     //   123,
 *     //   789,
 *     //   ReferenceError: coffffnsole is not defined
 *     //   345
 *     // ]
 *   })
 * ```
 *
 * @name   .parallel
 * @param  {Array} `<iterable>` iterable object like array with any type of values
 * @param  {Function} `[mapper]` function to apply to each item in `iterable`, see [item section](#item)
 * @param  {Object} `[opts]` see [options section](#options)
 * @return {Promise} Always resolved or rejected promise
 * @api public
 */

eachPromise.parallel = function eachParallel (iterable, mapper, opts) {
  var options = utils.defaults(mapper, opts)
  return eachPromise.each(iterable, options.mapper, utils.extend(options, {
    serial: false
  }))
}

/**
 * > Iterate over `iterable` in series or parallel (default), depending on
 * default `opts`. Pass `opts.serial: true` if you
 * want to iterate in series, pass `opts.serial: false` or does not
 * pass anything for parallel.
 *
 * **Example**
 *
 * ```js
 * var delay = require('delay')
 * var eachPromise = require('each-promise')
 *
 * var arr = [
 *   123,
 *   function () {
 *     return delay(500).then(() => 456)
 *   },
 *   Promise.resolve(678),
 *   function () {
 *     return 999
 *   },
 *   function () {
 *     return delay(200).then(() => 'foo')
 *   }
 * ]
 *
 * eachPromise
 *   .each(arr)
 *   .then(function (res) {
 *     console.log('done', res) // => [123, 678, 999, 'foo', 456]
 *   })
 * ```
 *
 * @name   .each
 * @param  {Array} `<iterable>` iterable object like array with any type of values
 * @param  {Function} `[mapper]` function to apply to each item in `iterable`, see [item section](#item)
 * @param  {Object} `[opts]` see [options section](#options)
 * @return {Promise} Always resolved or rejected promise
 * @api public
 */

eachPromise.each = function each (iterable, mapper, opts) {
  if (typeof iterable !== 'object') {
    var err = new TypeError('expect `iterable` to be array, iterable or object')
    return Promize.reject(err)
  }
  var options = utils.defaults(mapper, opts)
  return promiseEach(iterable, options)
}

/**
 * > Base iterate logic
 *
 * @param  {Array|Object} `<iterable>`
 * @param  {Object} `[opts]`
 * @return {Promise}
 * @api private
 */

function promiseEach (iterable, opts) {
  return new opts.Promise(function (resolve, reject) {
    var results = []
    var arr = Array.isArray(iterable) ? iterable : []
    arr.doneCount = 0

    if (!arr.length && typeof iterable === 'object') {
      for (var key in iterable) {
        arr.push(iterable[key])
      }
    }

    opts.concurrency = opts.serial === false ? opts.concurrency : 1
    opts.concurrency = opts.concurrency || arr.length

    opts.start()
    if (!opts.serial) {
      for (var index = 0; index < opts.concurrency; index++) {
        utils.iterator(arr, results)(opts, resolve, reject)(index)
      }
      return
    }
    utils.iterator(arr, results)(opts, resolve, reject)(0)
  })
}

module.exports = eachPromise
