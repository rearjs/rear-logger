# Change Log

## [0.1.0] 2017-06-16

### Changed

* The `warn` function now accept and optional _assert_ argument that define
  if the warning message should be printed or not:
   
  For example: `logger.warn(!user.isAuthenticated(), 'Permission denied')`
    
[0.1.0]: https://github.com/rearjs/rear-logger/tree/0.1.0