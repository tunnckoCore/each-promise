'use strict'

var utils = require('lazy-cache')(require)
var fn = require
require = utils // eslint-disable-line no-undef, no-native-reassign, no-global-assign

/**
 * Lazily required module dependencies
 */

require('try-catch-core')
require('extend-shallow', 'extend')
require('native-promise', 'Promise')
require = fn // eslint-disable-line no-undef, no-native-reassign, no-global-assign

utils.defaults = function defaults (mapper, opts) {
  var options = null

  if (mapper && typeof mapper === 'object') {
    options = mapper
    mapper = null
  }
  options = utils.extend({}, options, opts)
  options = utils.extend({
    Promise: utils.Promise,
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

utils.tryCatch = function tryCatch (fn, options) {
  return new options.Promise(function (resolve, reject) {
    utils.tryCatchCore(fn, options, function (err, res) {
      if (err || res instanceof Error) {
        return reject(err || res)
      }
      return resolve(res)
    })
  })
}

utils.iterator = function iterator (arr, results) {
  return function (options, resolve, reject) {
    return function next (index) {
      if (index >= arr.length) {
        return
      }

      var item = arr[index]
      options.beforeEach({ value: item, index: index }, index, arr)

      var val = typeof item === 'function'
        ? utils.tryCatch(item, options)
        : item

      var promise = val instanceof Error
        ? options.Promise.reject(val)
        : options.Promise.resolve(val)

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
            return
          }
        })
    }
  }
}

utils.handleResults = function handleResults (config, options) {
  return function (name) {
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
 * Expose `utils` modules
 */

module.exports = utils
