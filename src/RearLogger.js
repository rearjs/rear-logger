/* @flow */
const isBrowser = require('./isBrowser')
const emoji = require('./emoji')
const Formatter = require('./Formatter')
const levels = require('./levels')
const TTYCodes = require('./TTYCodes')

declare type RearLoggerProps = {
  enabled: boolean,
  showName: boolean,
  showLevelName: boolean,
  showTimeLabel: boolean,
  showDiffLabel: boolean,
  formatters: Object,
  codeMap: Object,
  disableCodeMap: boolean,
  levels: Object,
  stdout?: Function,
  stderr?: Function
}

declare type RearLoggerTS = {
  current: number,
  last: number,
  diff: number
}

const defaultProps: RearLoggerProps = {
  enabled: true,
  showName: false,
  showLevelName: true,
  showTimeLabel: false,
  showDiffLabel: false,
  formatters: {},
  codeMap: emoji,
  disableCodeMap: false,
  levels: {},
  stdout: undefined,
  stderr: undefined
}

class RearLogger {
  name: string
  props: RearLoggerProps
  _loggerName: string
  _formatter: Formatter
  _timestamps: RearLoggerTS
  _levels: Object
  _firstClear: boolean

  constructor (name: string, props: RearLoggerProps) {
    if (!name)
      throw new Error('Show some love for your logger. Give it a name!')

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
    const rnd = (min, max) => Math.floor(Math.random() * (max - min) + min)
    const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan']
    const rndNum = rnd(0, colors.length - 1)
    const rndColor = colors[rndNum] + ''
    this._loggerName = this._formatter
      .format('%c' + this.name + ':', rndColor)
      .stringValue

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

    const formatted = this._formatter.format(message, ...args)

    if (this.props.showLevelName && typeof level === 'string' && level !== 'none') {
      prefix = this._formatter
        .format('%c' + level, this._levels[level] || 'white')
        .stringValue + pad
    }

    let timeLabel = this.props.showTimeLabel ? this._timeLabel() + pad : ''
    let diffLabel = this.props.showDiffLabel ? this._diffLabel() + pad : ''
    let formattedMessage = this.props.showDiffLabel
      ? formatted.stringValue + pad
      : formatted.stringValue
    let loggerName = this.props.showName ? this._loggerName + pad : ''

    log(
      true,
      `${loggerName}${timeLabel}${prefix}${formattedMessage}${diffLabel}`,
      formatted.args
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
    if (isBrowser) {
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
    if (!this.props.enabled || isBrowser) return
    var rewrite = TTYCodes.MOVE_LEFT
    for (var i = 0; i < lines; i++) {
      rewrite += TTYCodes.MOVE_UP + (clear ? TTYCodes.CLEAR_LINE : '')
    }
    rewrite += TTYCodes.CLEAR_LINE
    return this.raw(rewrite)
  }

  toString (): string {
    return `[RearLogger ${this.name}]`
  }

  _stdout (postfix: boolean, str: string, ...args: Array<any>) {
    if (typeof this.props.stdout === 'function') {
      this.props.stdout(str, ...args)
    } else if (isBrowser) {
      if (typeof console !== 'undefined') {
        console.log(str, ...args)
      }
    } else {
      let message = str + args.join()
      if (postfix) message += '\n'
      process.stderr.write(message)
    }
  }

  _stderr (postfix: boolean, str: string, ...args: Array<any>) {
    args = args || []
    if (typeof this.props.stderr === 'function') {
      this.props.stderr(str, ...args)
    } else if (isBrowser) {
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
    if (typeof this.props.stdout === 'function') {
      this.props.stdout(str, ...args)
    } else if (isBrowser) {
      if (typeof console !== 'undefined' && console.warn) {
        console.warn(str, ...args)
      }
    } else {
      let message = str + args.join()
      if (postfix) message += '\n'
      process.stdout.write(message)
    }
  }

  _diffLabel (): string {
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

    return this._formatter.format('%c' + label, style).stringValue
  }

  _timeLabel (): string {
    const style = this._levels.hasOwnProperty('diffLabel')
      ? this._levels.timeLabel
      : 'dim_white'

    const date = new Date(this._timestamps.current)
    const normalize = (num, f) => num < f ? '0' + num : num
    const hh = normalize(date.getHours(), 10)
    const mm = normalize(date.getMinutes(), 10)
    const ss = normalize(date.getSeconds(), 10)
    const ms = normalize(date.getMilliseconds(), 100)

    return this._formatter
      .format(`%c[${hh}:${mm}:${ss}.${ms}]`, style)
      .stringValue
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
      const propType = typeof src[prop]
      if (propType === 'string' && typeof dest[prop] === 'undefined') {
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
