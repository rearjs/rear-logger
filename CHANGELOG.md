# Change Log

## [Unreleased]

### Changed

*  The `warn` function now accept and optional _assert_ argument that define
   if the warning message should be printed or not:
   For example: `logger.warn(!user.isAuthenticated(), 'Permission denied')`
    