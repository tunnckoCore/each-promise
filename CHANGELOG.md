# Change Log

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

<a name="1.0.5"></a>
## [1.0.5](https://github.com/tunnckoCore/each-promise/compare/v1.0.4...v1.0.5) (2017-03-19)


### Bug Fixes

* **deps:** force update deps, swtich to use "native-or-another" ([4136190](https://github.com/tunnckoCore/each-promise/commit/4136190))
* **docs:** update docs ([f3696a6](https://github.com/tunnckoCore/each-promise/commit/f3696a6))
* **update:** cleanup ([9a3edb0](https://github.com/tunnckoCore/each-promise/commit/9a3edb0))



<a name="1.0.4"></a>
## [1.0.4](https://github.com/tunnckocore/each-promise/compare/v1.0.3...v1.0.4) (2017-03-15)


### Bug Fixes

* **ci:** disallow failures on node 0.10 and node 0.12 ([29f55fb](https://github.com/tunnckocore/each-promise/commit/29f55fb)), closes [#24](https://github.com/tunnckocore/each-promise/issues/24)
* **completion:** use `redolent` for executing the functions ([60e3b84](https://github.com/tunnckocore/each-promise/commit/60e3b84))
* **handling:** always completion; handle cases when fn has callback argument ([b2323a7](https://github.com/tunnckocore/each-promise/commit/b2323a7)), closes [#23](https://github.com/tunnckocore/each-promise/issues/23)
* **hooks:** ensure finish hook is called when settle:false ([1de4ccc](https://github.com/tunnckocore/each-promise/commit/1de4ccc))
* **index.js:** pass options to redolent from promiseEach factory ([9ee5d1a](https://github.com/tunnckocore/each-promise/commit/9ee5d1a))
* **nyc:** force nyc to 100% coverage ([98ef4a3](https://github.com/tunnckocore/each-promise/commit/98ef4a3))
* **package.json:** fix lint script to lint exact files ([182865c](https://github.com/tunnckocore/each-promise/commit/182865c))
* **standard:** bump standard to v9 ([ff11c4e](https://github.com/tunnckocore/each-promise/commit/ff11c4e))
* **tests:** improve and organize tests - should work on node 0.10\n\nyou must provide a opts.Promise if you are in env that don\'t have native Promise support. If you\ndon\'t provide opts.Promise AND no native Promise support AND invalid iterable is passed to some of\nthe methods then THEY WILL THROW a TypeError with message: no native Promise and no opts.Promise.\n\nNO break-ing! ALL methods returns a promise except ONE VERY specific case when no native promise\nsupport AND invalid iterable ([f810fe4](https://github.com/tunnckocore/each-promise/commit/f810fe4))



<a name="1.0.3"></a>
## [1.0.3](https://github.com/tunnckocore/each-promise/compare/v1.0.2...v1.0.3) (2017-02-28)


### Bug Fixes

* **ci:** update travis, add appveyor ([392ba5c](https://github.com/tunnckocore/each-promise/commit/392ba5c))
* **feature:** use try-catch-core when item is function ([59796cf](https://github.com/tunnckocore/each-promise/commit/59796cf)), closes [#9](https://github.com/tunnckocore/each-promise/issues/9)
* **options:** ensure variadic arguments ([63d98d2](https://github.com/tunnckocore/each-promise/commit/63d98d2)), closes [#19](https://github.com/tunnckocore/each-promise/issues/19)
* **package:** update npm scripts & nyc ([8e827ab](https://github.com/tunnckocore/each-promise/commit/8e827ab))
* **tests:** ensure synchronous functions throw when in "settle: true" mode ([8069464](https://github.com/tunnckocore/each-promise/commit/8069464)), closes [#3](https://github.com/tunnckocore/each-promise/issues/3)



<a name="1.0.2"></a>
## [1.0.2](https://github.com/tunnckocore/each-promise/compare/v1.0.1...v1.0.2) (2016-11-14)


### Bug Fixes

* **package:** update deps, use "native-promise" to detect Promise ([4146b05](https://github.com/tunnckocore/each-promise/commit/4146b05))



<a name="1.0.1"></a>
## [1.0.1](https://github.com/tunnckocore/each-promise/compare/v1.0.0...v1.0.1) (2016-11-13)


### Bug Fixes

* **readme:** update background section ([4de3ec8](https://github.com/tunnckocore/each-promise/commit/4de3ec8))





## 1.0.0 - 2016-11-13
- First release
- semantic versioning
- add docs
- add keywords
- implement

## 0.0.0 - 2016-11-10
- Initial commit