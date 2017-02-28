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

var fixtureTwo = function () {
  return [
    delay(900).then(() => 1),
    () => delay(770).then(() => { throw new Error('foo') }),
    () => delay(620).then(() => 3),
    delay(800).then(() => 4),
    () => delay(700).then(() => 5)
  ]
}

test('should `.serial` return rejected promise if not an `iterable`', function () {
  return eachPromise.serial(123).catch(function (err) {
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
  return eachPromise.serial(fixtureTwo()).then(function (res) {
    test.strictEqual(res.length >= 5, true)
    test.strictEqual(res[0], 1)
    test.strictEqual(res[1].name, 'Error')
    test.strictEqual(res[2], 3)
    test.strictEqual(res[3], 4)
    test.strictEqual(res[4], 5)
  })
})

test('should `.serial` stop after first error if settle:false', function () {
  return eachPromise.serial(fixtureTwo(), { settle: false }).catch(function (err) {
    test.strictEqual(err.name, 'Error')
    test.strictEqual(err.message, 'foo')
  })
})

test('should `.serial` hooks be called', function () {
  var befores = 0
  var afters = 0
  var called = 0

  return eachPromise.serial(fixtureTwo(), {
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

test('should `.serial` accept `iterable` object', function (done) {
  var fixtureObj = {
    a: 123,
    b: Promise.reject(new Error('qux')),
    c: () => 456,
    d: () => Promise.resolve(567),
    e: () => new Error('zzz1'),
    f: new Error('zzz2')
  }
  eachPromise.serial(fixtureObj).then(function (res) {
    test.strictEqual(res.length, 6)
    test.strictEqual(res[0], 123)
    test.strictEqual(res[1].name, 'Error')
    test.strictEqual(res[2], 456)
    test.strictEqual(res[3], 567)
    test.strictEqual(res[4].message, 'zzz1')
    test.strictEqual(res[5].message, 'zzz2')
    done()
  })
})

test('should `.serial` catch returned rejected promise', function () {
  return eachPromise.serial([
    function () {
      return Promise.reject(new Error('foo bar qux'))
    }
  ], { settle: false }).catch(function (err) {
    test.strictEqual(err.name, 'Error')
    test.strictEqual(err.message, 'foo bar qux')
  })
})

test('should `.serial` catch thrown errors', function () {
  var fnThrows = function () {
    zaz // eslint-disable-line no-undef
  }

  return eachPromise.serial([fnThrows], {
    settle: false
  }).catch(function (err) {
    test.strictEqual(/zaz is not defined/.test(err.message), true)
    test.strictEqual(err.name, 'ReferenceError')
  })
})

test('should `.serial` catch returned errors', function () {
  var fn = function () { return new Error('xyz') }
  var opts = { settle: false }

  return eachPromise.serial([fn], opts).catch(function (err) {
    test.strictEqual(err.name, 'Error')
    test.strictEqual(err.message, 'xyz')
  })
})

test('should `.serial` not have flat results when `flat: false`', function () {
  return eachPromise.each([() => 111, () => 222], {
    flat: false
  }).then(function (res) {
    test.strictEqual(res.length, 2)
    test.strictEqual(res[0].value, 111)
    test.strictEqual(res[1].value, 222)
  })
})
