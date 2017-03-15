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

var fixtureOne = [
  123,
  function a () {
    return 456
  },
  false,
  Bluebird.resolve(555),
  'foo',
  function b () {
    return Bluebird.resolve(666)
  },
  789
]

var fixtureTwo = function () {
  return [
    delay(900).then(function () { return 1 }),
    function () { return delay(770).then(function () { throw new Error('foo') }) },
    function () { return delay(620).then(function () { return 3 }) },
    delay(800).then(function () { return 4 }),
    function () { return delay(700).then(function () { return 5 }) }
  ]
}

function factory (fnSerial) {
  test('should `.serial` resolve any type of values from iterable', function (done) {
    fnSerial(fixtureOne).then(function (res) {
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
      done()
    }, done).catch(done)
  })

  test('should `.serial` not stop after first error if settle:true (default)', function (done) {
    fnSerial(fixtureTwo()).then(function (res) {
      test.strictEqual(res.length >= 5, true)
      test.strictEqual(res[0], 1)
      test.strictEqual(res[1].name, 'Error')
      test.strictEqual(res[2], 3)
      test.strictEqual(res[3], 4)
      test.strictEqual(res[4], 5)
      done()
    }, done).catch(done)
  })

  test('should `.serial` stop after first error if settle:false', function (done) {
    fnSerial(fixtureTwo(), { settle: false }).catch(function (err) {
      test.strictEqual(err.name, 'Error')
      test.strictEqual(err.message, 'foo')
      done()
    }).catch(done)
  })

  test('should `.serial` hooks be called', function (done) {
    var befores = 0
    var afters = 0
    var called = 0

    fnSerial(fixtureTwo(), {
      start: function () { called++ },
      beforeEach: function () { befores++ },
      afterEach: function () { afters++ },
      finish: function () { called++ },
      settle: true
    }).then(function () {
      test.strictEqual(called, 2)
      test.strictEqual(befores, 5, 'should call beforeEach hook for each')
      test.strictEqual(afters, 5, 'should call afterEach hook for each')
      done()
    }, done).catch(done)
  })

  test('should `.serial` accept `iterable` object', function (done) {
    var fixtureObj = {
      a: 123,
      b: Bluebird.reject(new Error('qux')),
      c: function () { return 456 },
      d: function () { return Bluebird.resolve(567) },
      e: function () { return new Error('zzz1') },
      f: new Error('zzz2')
    }
    fnSerial(fixtureObj).then(function (res) {
      test.strictEqual(res.length, 6)
      test.strictEqual(res[0], 123)
      test.strictEqual(res[1].name, 'Error')
      test.strictEqual(res[2], 456)
      test.strictEqual(res[3], 567)
      test.strictEqual(res[4].message, 'zzz1')
      test.strictEqual(res[5].message, 'zzz2')
      done()
    }, done).catch(done)
  })

  test('should `.serial` catch returned rejected promise', function (done) {
    fnSerial([
      function () {
        return Bluebird.reject(new Error('foo bar qux'))
      }
    ], { settle: false }).catch(function (err) {
      test.strictEqual(err.name, 'Error')
      test.strictEqual(err.message, 'foo bar qux')
      done()
    }).catch(done)
  })

  test('should `.serial` catch thrown errors', function (done) {
    var fnThrows = function () {
      zaz // eslint-disable-line no-undef, no-unused-expressions
    }

    fnSerial([fnThrows], {
      settle: false
    }).catch(function (err) {
      test.strictEqual(/zaz is not defined/.test(err.message), true)
      test.strictEqual(err.name, 'ReferenceError')
      done()
    }).catch(done)
  })

  test('should `.serial` catch returned errors', function (done) {
    var fn = function () { return new Error('xyz') }
    var options = { settle: false }

    fnSerial([fn], options).catch(function (err) {
      test.strictEqual(err.name, 'Error')
      test.strictEqual(err.message, 'xyz')
      done()
    }).catch(done)
  })

  test('should `.serial` not have flat results when `flat: false`', function (done) {
    var fns = [
      function () { return 111 },
      function () { return 222 }
    ]
    fnSerial(fns, {
      flat: false
    }).then(function (res) {
      test.strictEqual(res.length, 2)
      test.strictEqual(res[0].value, 111)
      test.strictEqual(res[1].value, 222)
      done()
    }, done).catch(done)
  }, true)

  test('should `.serial` catch when sync throw in settle:true mode', function (done) {
    fnSerial([
      function () { return 123 },
      function () { throw new Error('sync fn throws') },
      function () { return { a: 'b' } }
    ]).then(function (res) {
      test.strictEqual(res.length, 3)
      test.strictEqual(res[0], 123)
      test.strictEqual(res[1].message, 'sync fn throws')
      test.strictEqual(res[2].a, 'b')
      done()
    }, done).catch(done)
  })

  test('should call finish hook if settle:false', function (done) {
    var called = 0
    var promise = fnSerial(fixtureTwo(), {
      settle: false,
      finish: function (err) {
        test.strictEqual(err instanceof Error, true)
        called++
      }
    })

    promise
      .catch(function (er) {
        test.strictEqual(called, 1)
        test.strictEqual(er instanceof Error, true)
        done()
      })
  })
}

if (semver.lt(process.version, '0.11.13')) {
  factory(function (val, opts) {
    return eachPromise.serial(val, extend({
      Promise: Bluebird
    }, opts))
  })

  test('should on node < 0.11.13 - return rejected promise if not an `iterable`, but has Promise', function (done) {
    eachPromise.serial(123, { Promise: Bluebird }).catch(function (err) {
      test.strictEqual(err.name, 'TypeError')
      test.strictEqual(err.message, 'expect `iterable` to be array, iterable or object')
      done()
    }).catch(done)
  })

  test('should on node < 0.11.13 - throw TypeError if `iterable` not valid and no native Promise or no opts.Promise', function (done) {
    function fixture () {
      eachPromise.serial(123)
    }
    test.throws(fixture, TypeError)
    test.throws(fixture, /no native Promise support and no opts\.Promise/)
    done()
  })
} else {
  factory(eachPromise.serial)

  test('should on node >= 0.11.13 return rejected promise if `iterable` not valid', function (done) {
    eachPromise.serial(123).catch(function (err) {
      test.strictEqual(err.name, 'TypeError')
      test.strictEqual(err.message, 'expect `iterable` to be array, iterable or object')
      done()
    }).catch(done)
  })
}
