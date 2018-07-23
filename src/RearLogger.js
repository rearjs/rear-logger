/* @flow */
const isBrowser = require('./isBrowser')
const emoji = require('./emoji')
const Formatter = require('./Formatter')
const levels = require('./levels')
const TTYCodes = require('./ttyCodes')
const {EventEmitter} = require('events');
const read = require('read');

declare type RearLoggerProps = {
  enabled: boolean,
  showName: boolean,
  nameColor?: Array<string>,
  showLevelName: boolean,
  showTimeLabel: boolean,
  showDiffLabel: boolean,
  formatters: Object,
  codeMap: Object,
  disableCodeMap: boolean,
  levels: Object,
  stdout?: Function,
  stdwarn?: Function,
  stderr?: Function,
}

declare type FormatResult = {
  stringValue: string,
  args: Array<any>|string
};


declare type RearLoggerTime = {
  current: number,
  last: number,
  diff: number
}

declare type Stdin = stream$Readable | tty$ReadStream;

const defaultProps: RearLoggerProps = {
  enabled: true,
  showName: false,
  nameColor: undefined,
  showLevelName: true,
  showTimeLabel: false,
  showDiffLabel: false,
  formatters: {},
  codeMap: emoji,
  disableCodeMap: false,
  levels: {},
  stdout: undefined,
  stdwarn: undefined,
  stderr: undefined
}

class RearLogger {
  name: string
  props: RearLoggerProps
  _loggerName: FormatResult
  _formatter: Formatter
  _timestamps: RearLoggerTime
  _levels: Object
  _firstClear: boolean

  constructor (name: string, props: RearLoggerProps) {
    if (!name) {
      throw new ReferenceError(
        'Show some love for your logger. Give it a name!'
      )
    }

    this.name = name
    this.props = Object.assign({}, defaultProps, props)

    this._formatter = new Formatter({
      formatters: this.props.formatters,
      codeMap: this.props.codeMap,
      disableCodeMap: this.props.disableCodeMap
    })

    this._levels = Object.assign({}, levels, this.props.levels)
    this._firstClear = true

    // Store a random colored version of the logger name to be printed
    // when `showName` prop is `true`
    let nameColor = this.props.nameColor;
    if (!nameColor) {
      const rnd = (min, max) => Math.floor(Math.random() * (max - min) + min)
      const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan']
      const rndNum = rnd(0, colors.length - 1)
      const rndColor = colors[rndNum] + ''
      nameColor = rndColor;
    } else {
      if (Array.isArray(nameColor)) {

      }
    }

    this._loggerName = this._formatter.format('%c' + this.name + ':', nameColor)

    build(this._levels, this)
  }

  raw (message: string, ...args: Array<any>): void {
    if (!this.props.enabled) return
    this._stdout(false, message, args)
  }

  message (level: string, message: string, ...args: Array<any>): void {
    if (!this.props.enabled) return
    this._updateTimestamps()

    let log, pad = ' ', prefix = ''
    switch (level) {
      case 'warn':
      case 'warning':
        log = this._stdwarn.bind(this)
        break
      case 'error':
        log = this._stderr.bind(this)
        break
      default:
        log = this._stdout.bind(this)
    }

    // Output an empty line if no message or arguments are provided
    if (!message && args.length === 0) return log(true, '')

    let logArgs = [];
    const formatted = this._formatter.format(message, ...args)

    let loggerName = ''
    if (this.props.showName) {
      loggerName = this._loggerName.stringValue + pad
      logArgs = logArgs.concat(this._loggerName.args);
    }

    // Format the prefix. If prefix has arguments (for examples: colorArgs)
    // they will be attached to the main formatted.args prop
    if (this.props.showLevelName && typeof level === 'string' && level !== 'none') {
      const formattedPrefix = this._formatter.format(
        '%c' + level,
        this._levels[level] || ['white', 'color: black']
      )

      if (Array.isArray(formattedPrefix.args)) {
        logArgs = logArgs.concat(formattedPrefix.args)
      }

      prefix = formattedPrefix.stringValue + pad
    }

    let timeLabel = ''
    if (this.props.showTimeLabel) {
      const formattedTimeLabel = this._timeLabel();
      if (Array.isArray(formattedTimeLabel.args)) {
        logArgs = logArgs.concat(formattedTimeLabel.args)
      }
      timeLabel = formattedTimeLabel.stringValue + pad
    }

    logArgs = logArgs.concat(formatted.args);

    let diffLabel = ''
    if (this.props.showDiffLabel) {
      const formattedDiffLabel = this._diffLabel();
      if (Array.isArray(formattedDiffLabel.args)) {
        logArgs = logArgs.concat(formattedDiffLabel.args)
      }
      diffLabel = formattedDiffLabel.stringValue + pad
    }

    let formattedMessage = this.props.showDiffLabel
      ? formatted.stringValue + pad
      : formatted.stringValue

    log(
      true,
      `${loggerName}${timeLabel}${prefix}${formattedMessage}${diffLabel}`,
      logArgs.filter(arg => arg !== undefined && arg !== "")
    )
  }

  log (message: string, ...args: Array<any>): void {
    return this.message.call(this, 'none', message || '', ...args)
  }

  warn (...args: Array<any>): void {
    if (!args) return
    if (typeof args[0] === 'boolean' && !args[0]) return

    let message = ''

    if (typeof args[0] === 'boolean' &&  typeof args[1] === 'string' ) {
      args.splice(0, 1)
    }

    const firstArg = args.splice(0, 1)
    message = firstArg[0]

    return this.message.call(this, 'warn', message || '', ...args)
  }

  error (message:string|Error, ...args: Array<any>): void {
    if (message instanceof Error) {
      this.message.call(this, 'error', message.message || '')
      this.message.call(this, 'none', message.stack.split('\n').slice(1).join('\n') || '')
      return
    }

    if (typeof message === 'object' && message.hasOwnProperty('message')) {
      message = message.message
    }

    return this.message.call(this, 'error', message || '', ...args)
  }

  debug (message: string, ...args: Array<any>): void {
    if (!this.props.enabled) return
    const pattern = isBrowser()
      ? localStorage.getItem('DEBUG')
      : process.env.DEBUG;

    const envDebug = pattern ? pattern.split(',') : [];
    if (Array.isArray(envDebug)) {
      const result = envDebug.filter(env => env.indexOf(this.name));
      if (result.length > 0) {
        result.forEach(env => {
          if (env === "") return
          const re = new RegExp(env);
          if (re.test(this.name)) {
            return this.message.call(this, 'debug', message || '', ...args)
          }
        });
      }
    }
  }

  highlight (message: string, ...args: Array<any>): void {
    const formatArgs = args.length > 0 ? ['bold_white'].concat(args) : ['bold_white']
    const formatted = this._formatter.format('%c' + message, ...formatArgs)
    const timeLabelSetting = this.props.showTimeLabel
    const diffLabelSetting = this.props.showDiffLabel
    this.props.showTimeLabel = false
    this.props.showDiffLabel = false
    this.message.call(this, 'none', formatted.stringValue)
    this.props.showTimeLabel = timeLabelSetting
    this.props.showDiffLabel = diffLabelSetting
  }

  clear (): void {
    if (!this.props.enabled) return
    if (isBrowser()) {
      if (typeof console !== 'undefined' && console.clear){
        console.clear()
        return
      }
    }

    const code = this._isFirstClear ? TTYCodes.FIRST_CLEAR : TTYCodes.CLEAR
    return this.raw(code)
  }

  clearLine (): void {
    return this.rewriteLine(0)
  }

  rewriteLine (lines: number, clear?: boolean): void {
    if (!this.props.enabled || isBrowser()) return
    var rewrite = TTYCodes.MOVE_LEFT
    for (var i = 0; i < lines; i++) {
      rewrite += TTYCodes.MOVE_UP + (clear ? TTYCodes.CLEAR_LINE : '')
    }
    rewrite += TTYCodes.CLEAR_LINE
    return this.raw(rewrite)
  }

  async prompt (...args: Array<any>): Promise<string> {
    if (!this.props.enabled || isBrowser()) return Promise.resolve('');
    const typeError = new TypeError(
      'Prompt expect an object or a string. Received: undefined'
    );
    if (!args) return Promise.reject(typeError);

    let message;
    let readOptions = {};

    if (typeof args[0] === 'object') {
      readOptions = args.shift()
    }

    if (typeof args[0] === 'string') {
      message = args.shift();
    } else {
      return Promise.reject(typeError);
    }

    return new Promise((resolve, reject) => {
      const messageText = this._formatter.format(message, ...args);

      Object.assign(readOptions, {
        prompt: `${messageText.stringValue}`,
        output: process.stdout,
        input: this._getStdIn()
      });

      read(readOptions, (err, answer) => {
        if (err) return reject(err);
        resolve(answer);
      });
    });
  }

  async question (...args: Array<any>): Promise<string> {
    if (!this.props.enabled || isBrowser()) return Promise.resolve('');
    const typeError = new TypeError(
      'Question expect an object or a string. Received: undefined'
    );
    if (!args) return Promise.reject(typeError);

    if (typeof args[0] === 'string') {
      let message = args.shift();
      message = `%cquestion%c ${message}`
      args = [message, 'dim', 'reset'].concat(args)
    }

    if (typeof args[0] === 'object' && typeof args[1] === 'string') {
      const readOpts = args.shift();
      let message = args.shift();
      message = `%cquestion%c ${message}`
      args = [readOpts, message, 'dim', 'reset'].concat(args)
    }

    try {
      return await this.prompt(...args);
    } catch (err) {
      if (err instanceof TypeError) return Promise.reject(typeError);
      return Promise.reject(err);
    }
  }

  hideCursor () {
    if (!this.props.enabled || isBrowser()) return
    const ansiEscape = '\u001B[?25l'
    return this.raw(ansiEscape)
  }

  showCursor () {
    if (!this.props.enabled || isBrowser()) return
    const ansiEscape = '\u001B[?25h'
    return this.raw(ansiEscape)
  }

  toString (): string {
    return `[RearLogger ${this.name}]`
  }

  _stdout (postfix: boolean, str: string, ...args: Array<any>) {
    if (typeof this.props.stdout === 'function') {
      this.props.stdout(str, ...args)
    } else if (isBrowser()) {
      if (typeof console !== 'undefined') {
        console.log(str, ...args)
      }
    } else {
      let message = str + args.join()
      if (postfix) message += '\n'
      process.stderr.write(message)
    }
  }

  _getStdIn (): Stdin {
    let stdin;
    try {
      stdin = process.stdin;
    } catch (err) {
      console.warn(err.message);
      delete process.stdin;
      // $FlowFixMe: this is valid!
      process.stdin = new EventEmitter();
      stdin = process.stdin;
    }

    return stdin;
  }

  _stderr (postfix: boolean, str: string, ...args: Array<any>) {
    args = args || []
    if (typeof this.props.stderr === 'function') {
      this.props.stderr(str, ...args)
    } else if (isBrowser()) {
      if (typeof console !== 'undefined') {
        console.error(str, ...args)
      }
    } else {
      let message = str + args.join()
      if (postfix) message += '\n'
      process.stderr.write(message)
    }
  }

  _stdwarn (postfix: boolean, str: string, ...args: Array<any>) {
    args = args || []
    if (typeof this.props.stdwarn === 'function') {
      this.props.stdwarn(str, ...args)
    } else if (isBrowser()) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(str, ...args)
      }
    } else {
      let message = str + args.join()
      if (postfix) message += '\n'
      process.stdout.write(message)
    }
  }

  _diffLabel (): FormatResult {
    const style = this._levels.hasOwnProperty('diffLabel')
      ? this._levels.diffLabel
      : 'dim_white'

    let label
    let diff = this._timestamps.diff

    if (diff < 1000) {
      label = '+' + diff + 'ms'
    } else if (diff < 60000) {
      label = '+' + (diff / 1000).toFixed(2)  + 's'
    } else {
      label = parseInt((diff / 1000 / 60), 10) + 'h'
    }

    return this._formatter.format('%c' + label, style)
  }

  _timeLabel (): FormatResult {
    const style = this._levels.hasOwnProperty('diffLabel')
      ? this._levels.timeLabel
      : 'dim_white'

    const date = new Date(this._timestamps.current)
    const normalize = (num, f) => num < f ? '0' + num : num
    const hh = normalize(date.getHours(), 10)
    const mm = normalize(date.getMinutes(), 10)
    const ss = normalize(date.getSeconds(), 10)
    const ms = normalize(date.getMilliseconds(), 100)

    return this._formatter.format(`%c[${hh}:${mm}:${ss}.${ms}]`, style)
  }

  _updateTimestamps (): void {
    const current = +new Date()

    if (!this._timestamps) {
      this._timestamps = {
        current: current,
        last: current,
        diff: 0
      }
      return
    }

    const last = this._timestamps.current
    this._timestamps = {
      current,
      last,
      diff: current - last
    }
  }
}

function build (src: Object, dest: Object) {
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      const isValidProp = typeof src[prop] === 'string'
        || Array.isArray(src[prop]);
      if (isValidProp && typeof dest[prop] === 'undefined') {
        dest[prop] = createLogFunction(dest, prop)
      }
    }
  }
}

function createLogFunction (builder: Object, prop: string): Function {
  return function log (message: string, ...args: Array<any>): void {
    return builder.message.call(builder, prop, message, ...args)
  }
}

module.exports = RearLogger;
