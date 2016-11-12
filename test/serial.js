/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

var test = require('mukla')
// var delay = require('delay')
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

test('should return rejected promise if `iterable` not an object or array', function () {
  var promise = eachPromise.serial(123)
  return promise.catch(function (err) {
    test.strictEqual(err.name, 'TypeError')
    test.strictEqual(err.message, 'expect `iterable` to be array, iterable or object')
  })
})

test('should resolve any type of values from iterable', function () {
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
