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

test('Should warn based on TRUE assert', function () {
  var expected = '{color: yellow}{} This should be formatted';
  var mockStdOut = jest.fn();
  var logger = RearLogger('formatter', {
    stdout: mockStdOut
  });
  logger.warn(1 > 0, 'This should be %s', 'formatted');
  var actual = mockStdOut.mock.calls[0][0];
  
  expect(actual).toBe(expected);
});

test('Should NOT warn based on FALSE assert', function () {
  var mockStdOut = jest.fn();
  var logger = RearLogger('formatter', {
    stdout: mockStdOut
  });
  logger.warn(false, 'This should be %s', 'formatted');
  
  expect(mockStdOut.mock.calls.length).toBe(0);
});

test('Should use standard warn when no assert specified', function () {
  var expected = '{color: yellow}{} This should be formatted';
  var mockStdOut = jest.fn();
  var logger = RearLogger('formatter', {
    stdout: mockStdOut
  });
  logger.warn('This should be %s', 'formatted');
  var actual = mockStdOut.mock.calls[0][0];
  
  expect(actual).toBe(expected);
});
