/** @jest-environment node */
var stripAnsi = require('strip-ansi');
var RearLogger = require('../index');
var LocalStorage = require('../__mocks__/localStorage');

// mock browser components
global.localStorage = new LocalStorage()
jest.mock('../lib/isBrowser', function () {
  return require('../__mocks__/isBrowser')
})

describe('test node functions', function () {
  it('should create logger', function () {
    var emoji = require('../lib/emoji');
    var logger = RearLogger('test', {
      showName: true,
      showTimeLabel: false,
      showDiffLabel: false,
      codeMap: emoji
    });

    expect(logger).toBeDefined();
  });

  it('should log custom level to stdout', function () {
    var mockStdOut = jest.fn();
    var expectedMessage = 'custom Test message'
    var logger = RearLogger('logMessage', {
      stdout: mockStdOut,
      levels: {
        custom: ['magenta', 'color: magenta']
      }
    });
    logger.custom('Test message');

    expect(mockStdOut.mock.calls.length).toBe(1)
    expect(stripAnsi(mockStdOut.mock.calls[0][0])).toBe(expectedMessage)
  })

  it('should log info message to stdout', function () {
    var mockStdOut = jest.fn();
    var logger = RearLogger('logMessage', {
      stdout: mockStdOut
    });

    logger.info('Test message');

    expect(mockStdOut.mock.calls.length).toBe(1);
  });

  it('should log error message to stderr', function () {
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

  it('should log debug messages when DEBUG env is set', function () {
    var mockStdOut = jest.fn();
    var expected = 'debug Test message';
    var logger = RearLogger('test:debug', {
      stdout: mockStdOut
    });

    process.env.DEBUG = "test:*,";
    logger.debug('Test message');
    var actual = stripAnsi(mockStdOut.mock.calls[0][0]);

    expect(mockStdOut.mock.calls.length).toBe(1);
    expect(actual).toBe(expected);
  });

  it('should NOT log debug messages when DEBUG is not set', function () {
    var mockStdOut = jest.fn();
    var logger = RearLogger('test:debug', {
      stdout: mockStdOut
    });

    process.env.DEBUG = "";
    logger.debug('Test message');

    expect(mockStdOut.mock.calls.length).toBe(0);
  });

  it('should format message', function () {
    var expected = 'info This should be formatted';
    var mockStdOut = jest.fn();
    var logger = RearLogger('formatter', {
      stdout: mockStdOut
    });

    logger.info('This should be %s', 'formatted');
    var actual = stripAnsi(mockStdOut.mock.calls[0][0]);

    expect(actual).toBe(expected);
  });

  it('should warn based on TRUE assert', function () {
    var expected = 'warn This should be formatted';
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });
    logger.warn(1 > 0, 'This should be %s', 'formatted');
    var actual = stripAnsi(mockStdWarn.mock.calls[0][0]);

    expect(actual).toBe(expected);
  });

  it('should NOT warn based on FALSE assert', function () {
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });
    logger.warn(false, 'This should be %s', 'formatted');

    expect(mockStdWarn.mock.calls.length).toBe(0);
  });

  it('should use standard warn when no assert specified', function () {
    var expected = 'warn This should be formatted';
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });
    logger.warn('This should be %s', 'formatted');
    var actual = stripAnsi(mockStdWarn.mock.calls[0][0]);

    expect(actual).toBe(expected);
  });

  it('should hide terminal cursor', function () {
    var ansiEscape = '\x1B[?25l';
    var mockStdOut = jest.fn();
    var logger = RearLogger('cursor-test', {
      stdout: mockStdOut
    });
    logger.hideCursor();
    var actual = mockStdOut.mock.calls[0][0];
    expect(actual).toBe(ansiEscape);
  });

  it('should show terminal cursor', function () {
    var ansiEscape = '\x1B[?25h';
    var mockStdOut = jest.fn();
    var logger = RearLogger('cursor-test', {
      stdout: mockStdOut
    });
    logger.showCursor();
    var actual = mockStdOut.mock.calls[0][0];
    expect(actual).toBe(ansiEscape);
  });

  it('Shuld prompt for question', function () {
    var logger = RearLogger('question-test');
    const expectedPrompt = 'question Do you like test?';

    expect.assertions(2);

    return logger.question('Do you like test?')
      .then(result => {
        const ansiPrompt = result.prompt;
        const textPrompt = stripAnsi(ansiPrompt);

        expect(ansiPrompt).not.toEqual(expectedPrompt);
        expect(textPrompt).toEqual(expectedPrompt);
      });
  });
});

describe('test browser functions', function () {
  beforeEach(function () {
    process.env.REARTEST_IS_BROWSER = true;
  });

  afterEach(function () {
    process.env.REARTEST_IS_BROWSER = false;
  });

  it('should log custom level to console.log', function () {
    var mockStdOut = jest.fn();
    var expectedMessage = '%ccustom Test %cmessage'
    var expectedArgs = [
      'color: magenta',
      'font-weight: bold'
    ]
    var logger = RearLogger('logMessage', {
      stdout: mockStdOut,
      levels: {
        custom: ['magenta', 'color: magenta']
      }
    });
    logger.custom('Test %cmessage', 'bold');

    expect(mockStdOut.mock.calls.length).toBe(1)
    expect(mockStdOut.mock.calls[0][0]).toEqual(expectedMessage)
    expect(mockStdOut.mock.calls[0][1]).toEqual(expectedArgs)
  })

  it('should have color arguments in correct order', function () {
    var mockStdOut = jest.fn();
    var expexctedPattern = /%ctest: %c\[[\d:.]*\] %cinfo Test %cmessage %c\+0ms/
    var expectedArgs = [
      "color: red",
      "color: blue",
      "color: black",
      "color: green; font-weight: bold",
      "color: black"
    ]
    var logger = RearLogger('test', {
      showName: true,
      nameColor: ['red', 'color: red'],
      showTimeLabel: true,
      showDiffLabel: true,
      stdout: mockStdOut
    });

    logger.info('Test %cmessage', 'bold_green');

    expect(mockStdOut.mock.calls.length).toBe(1)
    expect(expexctedPattern.test(mockStdOut.mock.calls[0][0])).toBeTruthy()
    expect(mockStdOut.mock.calls[0][1]).toEqual(expectedArgs)
  })

  it('should log info message to console.log', function () {
    var expectedMessage = "%cinfo Test message";
    var expectedArgs = ["color: blue"];
    var mockStdOut = jest.fn();

    var logger = RearLogger('test:logger', {
      stdout: mockStdOut
    });

    logger.info('Test message');

    expect(mockStdOut.mock.calls.length).toBe(1);
    expect(mockStdOut.mock.calls[0][0]).toBe(expectedMessage);
    expect(mockStdOut.mock.calls[0][1]).toEqual(expectedArgs);
  });

  it('should log error message to console.error', function () {
    var expectedMessage = "%cerror console.error should be called";
    var expectedArgs = ["color: red"]
    var mockStdOut = jest.fn();
    var mockStdErr = jest.fn();
    var logger = RearLogger('logErrorMessage', {
      stdout: mockStdOut,
      stderr: mockStdErr
    });

    logger.error('console.error should be called');

    expect(mockStdOut.mock.calls.length).toBe(0);
    expect(mockStdErr.mock.calls.length).toBe(1);
    expect(mockStdErr.mock.calls[0][0]).toEqual(expectedMessage);
    expect(mockStdErr.mock.calls[0][1]).toEqual(expectedArgs);
  });

  it('should log debug messages when DEBUG is set in localStorage', function () {
    var mockStdOut = jest.fn();
    var expectedMessage = '%cdebug Test message';
    var expectedArgs = ['color: magenta'];
    var logger = RearLogger('test:debug', {
      stdout: mockStdOut
    });

    global.localStorage.setItem("DEBUG", "test:*,");
    logger.debug('Test message');

    expect(mockStdOut.mock.calls.length).toBe(1);
    expect(mockStdOut.mock.calls[0][0]).toEqual(expectedMessage);
    expect(mockStdOut.mock.calls[0][1]).toEqual(expectedArgs);

    global.localStorage.removeItem("DEBUG", "test:*,");
  });

  it('should NOT log debug messages when DEBUG is not set', function () {
    var mockStdOut = jest.fn();
    var logger = RearLogger('test:debug', {
      stdout: mockStdOut
    });

    global.localStorage.removeItem("DEBUG");
    logger.debug('Test message');

    expect(mockStdOut.mock.calls.length).toBe(0);
  });

  it('should format message', function () {
    var expectedMessage = '%cinfo This should be formatted'
    var expectedArgs = ["color: blue"]
    var mockStdOut = jest.fn();
    var logger = RearLogger('formatter', {
      stdout: mockStdOut
    });

    logger.info('This should be %s', 'formatted');

    expect(mockStdOut.mock.calls[0][0]).toEqual(expectedMessage);
    expect(mockStdOut.mock.calls[0][1]).toEqual(expectedArgs);
  });

  it('should warn based on TRUE assert', function () {
    var expectedMessage = '%cwarn This should be formatted';
    var expectedArgs = ['color: brown'];
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });

    logger.warn(1 > 0, 'This should be %s', 'formatted');

    expect(mockStdWarn.mock.calls.length).toBe(1);
    expect(mockStdWarn.mock.calls[0][0]).toEqual(expectedMessage);
    expect(mockStdWarn.mock.calls[0][1]).toEqual(expectedArgs);
  });

  it('should NOT warn based on FALSE assert', function () {
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });
    logger.warn(false, 'This should be %s', 'formatted');

    expect(mockStdWarn.mock.calls.length).toBe(0);
  });

  it('should use standard warn when no assert specified', function () {
    var expectedMessage = '%cwarn This should be formatted';
    var expectedArgs = ['color: brown'];
    var mockStdWarn = jest.fn();
    var logger = RearLogger('formatter', {
      stdwarn: mockStdWarn
    });
    logger.warn('This should be %s', 'formatted');

    expect(mockStdWarn.mock.calls.length).toBe(1);
    expect(mockStdWarn.mock.calls[0][0]).toEqual(expectedMessage);
    expect(mockStdWarn.mock.calls[0][1]).toEqual(expectedArgs);
  });

  it('should hide terminal cursor', function () {
    var mockStdOut = jest.fn();
    var logger = RearLogger('cursor-test', {
      stdout: mockStdOut
    });
    logger.hideCursor();
    expect(mockStdOut.mock.calls.length).toBe(0);
  });

  it('should have show terminal fuction disabled', function () {
    var mockStdOut = jest.fn();
    var logger = RearLogger('cursor-test', {
      stdout: mockStdOut
    });
    logger.showCursor();
    expect(mockStdOut.mock.calls.length).toBe(0);
  });

  it('Shuld prompt for question', function () {
    var logger = RearLogger('question-test');
    expect.assertions(1);
    return logger.question('Do you like test?')
      .then(result => {
        expect(result).toEqual('');
      });
  });
})


