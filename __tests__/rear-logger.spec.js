var RearLogger = require('../index');

test('Should create logger', function () {
  var emoji = require('../lib/emoji');
  var logger = RearLogger('test', {
    showName: true,
    showTimeLabel: false,
    showDiffLabel: false,
    codeMap: emoji
  });

  expect(logger).toBeDefined();
});

test('Should log message to stdout', function () {
  var mockStdOut = jest.fn();
  var logger = RearLogger('logMessage', {
    stdout: mockStdOut
  });

  logger.info('Test message');

  expect(mockStdOut.mock.calls.length).toBe(1);
});

test('Should log error message to stderr', function () {
  var mockStdOut = jest.fn();
  var mockStdErr = jest.fn();
  var logger = RearLogger('logErrorMessage', {
    stdout: mockStdOut,
    stderr: mockStdErr
  });

  logger.error('stderr should be called');

  expect(mockStdOut.mock.calls.length).toBe(0);
  expect(mockStdErr.mock.calls.length).toBe(1);
});

test('Should format message', function () {
  var expected = '{color: blue}{} This should be formatted';
  var mockStdOut = jest.fn();
  var logger = RearLogger('formatter', {
    stdout: mockStdOut
  });

  logger.info('This should be %s', 'formatted');
  var actual = mockStdOut.mock.calls[0][0];

  expect(actual).toBe(expected);
});
