/*!
 * each-promise <https://github.com/tunnckoCore/each-promise>
 *
 * Copyright (c) Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var extendShallow = require('extend-shallow')
var redolent = require('redolent')

var utils = {}
utils.extend = extendShallow
utils.promisify = redolent

utils.defaults = function defaults (mapper, opts) {
  var options = null

  if (mapper && typeof mapper === 'object') {
    options = mapper
    mapper = null
  }

  options = utils.extend({}, options, opts)
  options = utils.extend({
    settle: true,
    flat: true,
    serial: false,
    concurrency: false,
    start: function startHook () {},
    beforeEach: function beforeEachHook () {},
    afterEach: function afterEachHook () {},
    finish: function finishHook () {}
  }, options)

  mapper = options.mapper || mapper
  options.mapper = typeof mapper === 'function' ? mapper : false

  return options
}

utils.iterator = function iterator (arr, results) {
  return function (options, resolve, reject) {
    return function next (index) {
      if (index >= arr.length) {
        return
      }

      var item = arr[index]
      options.beforeEach({ value: item, index: index }, index, arr)

      var promise = typeof item === 'function'
        ? utils.promisify(item, options)()
        : utils.promisify(function () { return item }, options)()

      var handle = utils.handleResults({
        arr: arr,
        index: index,
        results: results
      }, options)

      promise
        .then(handle('value'), handle('reason'))
        .then(function onresolved () {
          if (arr.doneCount++ === arr.length - 1) {
            options.finish(null, results)
            resolve(results)
            return
          }
          next(index + options.concurrency)
        }, function onrejected (err) {
          /* istanbul ignore next */
          if (options.settle === false) {
            options.finish(err, results)
            reject(err)
          }
        })
    }
  }
}

utils.handleResults = function handleResults (config, options) {
  return function handle (name) {
    return function handler (val) {
      var ret = {}

      ret[name] = val
      ret.index = config.index

      options.afterEach(ret, ret.index, config.arr)
      if (typeof options.mapper === 'function') {
        config.results.push(options.mapper(ret, ret.index, config.arr))
        return
      }

      config.results.push(options.flat ? ret[name] : ret)
      if (options.settle === false && ret.reason) {
        throw val
      }
    }
  }
}

/**
 * Expose `utils` module
 */

module.exports = utils
