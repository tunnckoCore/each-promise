/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

// var test = require('mukla')
var delay = require('delay')
var each = require('./index')

var foo = 'initial'
var arr = [
  function one () {
    return delay(200).then(() => {
      // console.log(11)
      return 123
    })
  },
  Promise.resolve('foobar'),
  function two () {
    return delay(1500).then(() => {
      // console.log(22)
      foo += '~third'
      return 345
    })
  },
  delay(10).then(() => 'zero'),
  function three () {
    return delay(400).then(() => {
      // console.log(33, foo)
      coffffnsole.log(3) // eslint-disable-line no-undef
      return 567
    })
  },
  'abc',
  function four () {
    return delay(250).then(() => {
      console.log(44)
      return 789
    })
  },
  function five () {
    return delay(100).then(() => {
      sasasa // eslint-disable-line no-undef
      // console.log(55)
      return 444
    })
  },
  function six () {
    return delay(80).then(() => {
      console.log(66)
      return 'last'
    })
  }
]

// .serial/.series:
// - works correctly
// .parallel:
// - ?? (not sure) bug when `settle: false` and `concurrency < arr.length`
//
var settle = false
each.parallel(arr/*, function mapper (item, index) {
  console.log(item, index)
}*/, {
  concurrency: 5,
  settle: settle,
  start: function () {
    console.log('start')
    console.log('====')
  },
  finish: function (err, res) {
    console.log('====')
    console.log('finish')
    if (err) console.log('err:', err)
    console.log('res:', res, res.length)
  },
  beforeEach: function (item, index) {
    if (index === 2) foo += '~beforeEach'
    if (index === 3) foo = 'reset'
    console.log('beforeEach', index)
  },
  afterEach: function (item, index) {
    if (item.reason) {
      console.log('error', index, item.reason)
    }
    if (index === 3) foo = 'reset'
    console.log('afterEach', index, foo === 'initial~beforeEach~third')
  }
})
.then(function (res) {
  console.log('ok')
})
.catch(function (er) {
  console.log('fail')
  if (settle === false) process.exit(0)
})
