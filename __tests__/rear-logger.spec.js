const RearLogger = require('../index')

test('Should create logger', () => {
  const emoji = require('../lib/emoji');
  const logger = RearLogger('test', {
    showName: true,
    showTimeLabel: false,
    showDiffLabel: false,
    codeMap: emoji
  });

  expect(logger).toBeDefined();
});

test('Should log message to stdout', () => {
  const mockStdOut = jest.fn();
  const logger = RearLogger('logMessage', {
    stdout: mockStdOut
  });

  logger.info('Test message');

  expect(mockStdOut.mock.calls.length).toBe(1);
});

test('Should log error message to stderr', () => {
  const mockStdOut = jest.fn();
  const mockStdErr = jest.fn();
  const logger = RearLogger('logErrorMessage', {
    stdout: mockStdOut,
    stderr: mockStdErr
  });

  logger.error('stderr should be called');

  expect(mockStdOut.mock.calls.length).toBe(0);
  expect(mockStdErr.mock.calls.length).toBe(1);
});

test('Should format message', () => {
  const expected = '{color: blue}{} This should be formatted';
  const mockStdOut = jest.fn();
  const logger = RearLogger('formatter', {
    stdout: mockStdOut
  });

  logger.info('This should be %s', 'formatted')
  const actual = mockStdOut.mock.calls[0][0]

  expect(actual).toBe(expected)
})
