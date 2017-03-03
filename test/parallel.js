/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
var delay = require('delay')
var eachPromise = require('../index')

var fixtureTwo = function () {
  return [
    delay(900).then(() => 1),
    () => delay(770).then(() => { throw new Error('errfoo') }),
    () => delay(620).then(() => 3),
    delay(800).then(() => 4),
    () => delay(700).then(() => 5)
  ]
}

test('should `.parallel` run with concurrency default to `iterable` length', function (done) {
  eachPromise.parallel(fixtureTwo()).then(function (res) {
    test.strictEqual(res.length, 5)
    test.strictEqual(res[0], 3)
    test.strictEqual(res[1], 5)
    test.strictEqual(res[2].name, 'Error')
    test.strictEqual(res[2].message, 'errfoo')
    test.strictEqual(res[3], 4)
    test.strictEqual(res[4], 1)
    done()
  })
})

test('should `.parallel` stop after first error if settle:false', function (done) {
  eachPromise.parallel(fixtureTwo(), { settle: false }).catch(function (err) {
    test.strictEqual(err !== null, true, 'err should be Error object')
    test.strictEqual(err.message, 'errfoo')
    test.strictEqual(err.name, 'Error')
    done()
  })
})

test('should `.parallel` with custom concurrency and `mapper`', function (done) {
  var concurrency = 3
  eachPromise.parallel(fixtureTwo(), function (item) {
    return (item.reason && item.reason.message) || item.value
  }, { concurrency: concurrency }).then(function (res) {
    test.strictEqual(res.length, 5)
    test.strictEqual(res[0], 3)
    test.strictEqual(res[1], 'errfoo')
    test.strictEqual(res[4], 5)
    done()
  })
})
