# Change Log

## [0.1.1] 2017-08-15

### :rocket: New Feature

* [#3] Add the ability to hide and show the cursor by calling `hideCursor` and 
  `showCursor` functions. ([@erremauro](https://github.com/erremauro)).
  
[#3]: https://github.com/rearjs/rear-logger/pull/3

## [0.1.0] 2017-06-16

### :rocket: New Feature

* The `warn` function now accept and optional _assert_ argument that define
  if the warning message should be printed or not:
   
  For example: `logger.warn(!user.isAuthenticated(), 'Permission denied')`

[0.1.1]: https://github.com/rearjs/rear-logger/compare/0.1.0...0.1.1    
[0.1.0]: https://github.com/rearjs/rear-logger/tree/0.1.0
