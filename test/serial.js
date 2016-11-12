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

var fixtureOne = [
  123,
  function a () {
    return 456
  },
  false,
  Promise.resolve(555),
  'foo',
  function b () {
    return Promise.resolve(666)
  },
  789
]

var fixtureTwo = [
  delay(900).then(() => 1),
  () => delay(770).then(() => { throw new Error('foo') }),
  () => delay(620).then(() => 3),
  delay(800).then(() => 4),
  () => delay(700).then(() => 5)
]

test('should `.serial` return rejected promise if `iterable` not an object or array', function () {
  var promise = eachPromise.serial(123)
  return promise.catch(function (err) {
    test.strictEqual(err.name, 'TypeError')
    test.strictEqual(err.message, 'expect `iterable` to be array, iterable or object')
  })
})

test('should `.serial` resolve any type of values from iterable', function () {
  return eachPromise.serial(fixtureOne).then(function (res) {
    test.strictEqual(res.length, 7)
    test.deepEqual(res, [
      123,
      456,
      false,
      555,
      'foo',
      666,
      789
    ])
  })
})

test('should `.serial` not stop after first error if settle:true (default)', function () {
  return delay(2000).then(function () {
    return eachPromise.serial(fixtureTwo).then(function (res) {
      test.strictEqual(res.length >= 5, true)
      test.strictEqual(res[0], 1)
      test.strictEqual(res[1].name, 'Error')
      test.strictEqual(res[2], 3)
      test.strictEqual(res[3], 4)
      test.strictEqual(res[4], 5)
    })
  })
})

test('should `.serial` stop after first error if settle:false', function () {
  return delay(5000).then(function () {
    return eachPromise.serial(fixtureTwo, { settle: false }).catch(function (err) {
      test.strictEqual(err.name, 'Error')
      test.strictEqual(err.message, 'foo')
    })
  })
})

test('should `.serial` hooks be called', function () {
  return delay(7000).then(function () {
    var befores = 0
    var afters = 0
    var called = 0
    return eachPromise.serial(fixtureTwo, {
      start: () => called++,
      beforeEach: () => befores++,
      afterEach: () => afters++,
      finish: () => called++,
      settle: true
    }).then(function () {
      test.strictEqual(called, 2)
      test.strictEqual(befores, 5, 'should call beforeEach hook for each')
      test.strictEqual(afters, 5, 'should call afterEach hook for each')
    })
  })
})

test('should `.serial` accept `iterable` object', function (done) {
  delay(9000).then(function () {
    var fixtureObj = {
      a: 123,
      b: Promise.reject(new Error('qux')),
      c: () => 456,
      d: () => Promise.resolve(567)
    }
    eachPromise.serial(fixtureObj).then(function (res) {
      test.strictEqual(res.length, 4)
      test.strictEqual(res[0], 123)
      test.strictEqual(res[1].name, 'Error')
      test.strictEqual(res[2], 456)
      test.strictEqual(res[3], 567)
      done()
    })
  })
})
