# Change Log

## [1.0.0] (2018-07-24)

### :bug: Bug Fixes

* [#7] Fix color formatting in browsers

### :house: Internal

* [#7] Add browser tests

[#6]: https://github.com/rearjs/rear-logger/pull/6
[#7]: https://github.com/rearjs/rear-logger/pull/7

## [0.3.0] (2018-07-07)

### :rocket: New Feature

* [#6] Add `debug` function to print debug messages. A `DEBUG`
environment variable or `localStorage` key is used to show or hide the messages
based on space or comma-delimited names.

[#6]: https://github.com/rearjs/rear-logger/pull/6

## [0.2.0] (2017-08-27)

### :rocket: New Feature

* [#5] Add `prompt` and `question` functions for reading user input in the
  console.

### :house: Internal

* [#4] Add show and hide cursor tests. Add `isBrowser` mock, to control the current logger context via
  `process.env.REARTEST_IS_BROWSER` variable ([@erremauro]).

[#5]: https://github.com/rearjs/rear-logger/pull/5
[#4]: https://github.com/rearjs/rear-logger/pull/4

## [0.1.1] (2017-08-15)

### :rocket: New Feature

* [#3] Add the ability to hide and show the cursor by calling `hideCursor` and
  `showCursor` functions ([@erremauro]).

[#3]: https://github.com/rearjs/rear-logger/pull/3

## [0.1.0] (2017-06-16)

### :rocket: New Feature

* The `warn` function now accept and optional _assert_ argument that define
  if the warning message should be printed or not:

  For example: `logger.warn(!user.isAuthenticated(), 'Permission denied')`

[@erremauro]: https://github.com/erremauro

[1.0.0]: https://github.com/rearjs/rear-logger/compare/0.3.0...1.0.0
[0.3.0]: https://github.com/rearjs/rear-logger/compare/0.2.0...0.3.0
[0.2.0]: https://github.com/rearjs/rear-logger/compare/0.1.1...0.2.0
[0.1.1]: https://github.com/rearjs/rear-logger/compare/0.1.0...0.1.1
[0.1.0]: https://github.com/rearjs/rear-logger/tree/0.1.0
