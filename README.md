# rear-logger
[![Build Status](https://travis-ci.org/rearjs/rear-logger.svg?branch=master)](https://travis-ci.org/rearjs/rear-logger)

A logger for Rear projects.

## How it works

Create a logger with name and options, then start logging on the predefined
levels: `success`, `info`, `warn` and `error`.

Level names can be added or customized by providing a key/value map
with level name and color in the `levels` option.

  ```javascript
  const createLogger = require('rear-logger');

  const name = 'MyAwesomeLogger';
  const options = {
    showName: true,
    showDiffLabel: true,
    levels: {
      hint: 'cyan'
    }
  };

  const logger = createLogger(name, options);
  logger.hint('Logger "%s" created with options: %O', name, options);
  ```

## Default Levels

|Name   |Color      |
|-------|-----------|
|log    |white      |
|none   |white      |
|debug  |magenta    |
|info   |blue       |
|success|green      |
|hint   |yellow     |
|warn   |yellow     |
|warning|yellow     |
|error  |red        |
|quit   |red        |
|GET    |bold_green |
|POST   |bold_yellow|
|PUT    |bold_blue  |
|DELETE |bold_red   |
|OPTIONS|bold_cyan  |

## Logger Options

|Name          |Type     |Default|Description                                  |
|--------------|---------|-------|---------------------------------------------|
|enabled       |[bool]   |true   |Enable or disable the logger output          |
|showName      |[bool]   |false  |Prefix logger name to the logged output      |
|showLevelName |[bool]   |true   |Print the log level in logged output         |
|showTimeLabel |[bool]   |false  |Print the current time in the logged output  |
|showDiffLabel |[bool]   |false  |Print the diff time from last logged messaged|
|formatters    |?object  |{}     |Accept additional text formatters            |
|codeMap       |[object] |<emoji>|Define additional code map (i.e. emoji-codes)|
|disableCodeMap|[bool]   |false  |Define code-map conversion (i.e. emoji-codes)|
|levels        |?object  |{}     |Define key/value level name and color pairs  |
|stdout        |?function|       |Custom stdout                                |
|stderr        |?function|       |Custom stderr                                |

## API

### constructor (name: string, props: RearLoggerProps)

Create a new logger with given `name` and options.

#### Parameters

  **name**: The logger name. When `showName` property is set to `true`, the
  name is prefixed to the logged message.
  **props**: Custom logger properties.

### raw (message: string, ...args: Array<any>): void

Print a `message` directly to the stdout much like a standard `console.log`
would do.

#### Parameters

  **message**: Message to be loggd
  **args**: Additional arguments

### message (level: string, message: string, ...args: Array<any>): void

Format and print a `message` for the given `level`.
Note: usually is more convenient to call the logger's `level` function as in
`logger.info('Hello world')`

#### Parameters

  **level**: The level name as defined in the levels options.
  **message**: Message to be logged
  **args**: Additional arguments
  
### warn (assert?: boolean, message: string, ...args: Array<any>): void

Format and print a warning message. When an `assert` is provided, the message
is conditionally printed based on the truthyness of the assertion.

### error (message: string|Error, ...args: Array<any>): void

Format and print an Error's message or a given `message` to the stderr.

#### Parameters

  **message**: A message to be logged or an Error object
  **args**: Additional arguments

### highlight (message: string, ...args: Array<any>): void

Format and print the given `message` as highlighted. An
highlighted message is bold and do not print time information.

#### Parameters

  **message**: A message to be logged or an Error object
  **args**: Additional arguments

### clear (): void

Clear the console

### clearLine (): void

Clear the current line.

### rewriteLine (lines: number, clear?: boolean): void

Move the cursor up for the given number of lines.

#### Parameters

  **lines**: Number of lines to move the cursor up.
  **clear**: Define if the lines being rewritten should be cleared
