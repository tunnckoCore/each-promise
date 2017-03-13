/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
var eachPromise = require('../index')
var Bluebird = require('bluebird')
var semver = require('semver')
var extend = require('extend-shallow')

var delay = function (fn, ms) {
  return new Bluebird(function (resolve) {
    setTimeout(resolve, ms)
  })
}

var specialError = new Error('errfoo')
var fixtureTwo = function () {
  return [
    delay(900).then(function () { return 1 }),
    function () { return delay(770).then(function () { throw specialError }) },
    function () { return delay(620).then(function () { return 3 }) },
    delay(800).then(function () { return 4 }),
    function () { return delay(700).then(function () { return 5 }) }
  ]
}

function factory (fnParallel) {
  test('should `.parallel` run with concurrency default to `iterable` length', function (done) {
    fnParallel(fixtureTwo()).then(function (res) {
      test.strictEqual(res.length, 5)
      // test.deepEqual(res, [1, 4, specialError, 3, 5]) // may not work
      test.strictEqual(res.indexOf(3) > -1, true)
      test.strictEqual(res.indexOf(5) > -1, true)
      test.strictEqual(res.indexOf(4) > -1, true)
      test.strictEqual(res.indexOf(1) > -1, true)
      test.strictEqual(res.indexOf(specialError) > -1, true)
      // test.strictEqual(res[0], 3)
      // test.strictEqual(res[1], 5)
      // test.strictEqual(res[2].name, 'Error')
      // test.strictEqual(res[2].message, 'errfoo')
      // test.strictEqual(res[3], 4)
      // test.strictEqual(res[4], 1)
      done()
    }, done).catch(done)
  })

  test('should `.parallel` stop after first error if settle:false', function (done) {
    fnParallel(fixtureTwo(), { settle: false }).catch(function (err) {
      test.strictEqual(err !== null, true, 'err should be Error object')
      test.strictEqual(err.message, 'errfoo')
      test.strictEqual(err.name, 'Error')
      done()
    }).catch(done)
  })

  test('should `.parallel` with custom concurrenc: 2 and `mapper`', function (done) {
    var concurrency = 2
    var mapper = function (item) {
      return (item.reason && item.reason.message) || item.value
    }
    fnParallel(fixtureTwo(), {
      concurrency: concurrency,
      mapper: mapper
    }).then(function (res) {
      test.strictEqual(res.length, 5)
      test.strictEqual(res.indexOf(1) > -1, true)
      test.strictEqual(res.indexOf(3) > -1, true)
      test.strictEqual(res.indexOf(4) > -1, true)
      test.strictEqual(res.indexOf(5) > -1, true)
      done()
    }, done).catch(done)
  })
}

if (semver.lt(process.version, '0.11.13')) {
  factory(function (val, opts) {
    return eachPromise.parallel(val, extend({
      Promise: Bluebird
    }, opts))
  })
} else {
  factory(eachPromise.parallel)
}
