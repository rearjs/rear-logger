/* @flow */
const isBrowser = require('./isBrowser');
const applyStyle = require('./applyStyle');
const stringifyObject = require('./stringifyObject');

declare type FormatterProps = {
  formatters?: Object,
  codeMap?: Object,
  disableCodeMap: boolean
};

declare type FormatResult = {
  stringValue: string,
  args: Array<any>|string
};

declare type ParseResult = {
  parsed: string,
  colorArgs: Array<any>
};

declare type FormatToken = {
  tag: string,
  content: string,
  arg: string,
  specifier: string
};

const defaultFormatters = {
  c: function (token) {
    return token.content
  },
  d: function (token) {
    if (isNaN(token.arg)) return token.content
    const parsedValue = parseFloat(token.arg)
    return token.content.replace(token.tag, parsedValue)
  },
  i: function (token) {
    if (isNaN(token.arg)) return token.content
    const parsedValue = parseInt(token.arg, 10)
    return token.content.replace(token.tag, parsedValue)
  },
  o: function (token) {
    if (typeof token.arg !== 'object') return token.content
    const parsedValue = stringifyObject(token.arg, {
      indent: '  ',
      inlineCharacterLimit: 32
    })
    return token.content.replace(token.tag, parsedValue)
  },
  O: function (token) {
    if (typeof token.arg !== 'object') return token.content
    const parsedValue = stringifyObject(token.arg, {
      indent: '  ',
      inlineCharacterLimit: 12
    })
    return token.content.replace(token.tag, parsedValue)
  },
  s: function (token) {
    return token.content.replace(token.tag, token.arg.toString())
  }
};

const defaultProps = {
  enableCodeMap: false,
  formatters: {},
  codeMap: {},
  disableCodeMap: false
};

class Formatter {
  props: FormatterProps
  _formatters: Object
  _codeMap: Object

  constructor (props: FormatterProps) {
    this.props = Object.assign({}, defaultProps, props)
    this._formatters = Object.assign({}, defaultFormatters, this.props.formatters)
    this._codeMap = Object.assign({}, this.props.codeMap)
  }

  format (str: string, ...args: Array<any>): FormatResult {
    if (args.length === 0) {
      return {
        stringValue: this.props.disableCodeMap
          ? str
          : this._replaceCodeMap(str),
        args: args
      }
    }

    const tokens = this._tokenize(str, args)
    const result: ParseResult = this._parseTokens(tokens);
    // prepend color args to args for browser compatibility
    if (result.colorArgs.length > 0) args = result.colorArgs.concat(args)

    return {
      stringValue: this.props.disableCodeMap
        ? result.parsed
        : this._replaceCodeMap(result.parsed),
      args: args.length > 0 ? args : ''
    }
  }

  _parseTokens (tokens: Array<FormatToken>): ParseResult {
    let parsed = ''
      , colorArgs = []

    tokens.forEach((token) => {
      if (token.specifier === 'c') colorArgs.push(token.arg)

      if (this._formatters[token.specifier]) {
        return parsed += this._formatters[token.specifier](token)
      }

      parsed += token.content
    })

    parsed = this._applyStyles(parsed, colorArgs)

    return {
      parsed: parsed,
      colorArgs: colorArgs
    }
  }

  _replaceCodeMap (str: string): string {
    if (!this._codeMap) return str

    const re = /(:(.*?):)/g
    let match = re.exec(str)

    while (match) {
      if (this._codeMap.hasOwnProperty(match[2])) {
        str = str.replace(match[1], this._codeMap[match[2]])
      }
      match = re.exec(str)
    }

    return str
  }

  _applyStyles (str: string, params: Array<any>): string {
    if (params.length === 0) return str

    let index, content = ''
    const colorMap = []
    do {
      index = str.indexOf('%c')
      if (index === -1) continue
      colorMap.push(index)
      str = str.slice(0, index) + str.slice(index + 2, str.length)
    } while(index >= 0)

    // add a mapping for `str` end position, if necessary
    if (colorMap.length > 0 && colorMap.slice(-1)[0] < str.length) {
      colorMap.push(str.length)
    }

    for (let i = 0, len = colorMap.length; i < len; i++) {
      let left = colorMap[i]
      let right = colorMap[i+1]

      let styles = params.length > 0 ? params.shift().toString().split('_') : []
      let inner = str.slice(left, right)

      let applied = isBrowser
        ? applyStyle(styles)
        : applyStyle(styles, inner)

      if (i === 0 && left > 0) applied = str.slice(0, left) + applied

      content += applied
    }

    return content
  }

  _tokenize (str: string, params: Array<any>): Array<FormatToken> {
    if (!str) return []

    const tokens = []
    let tag = '', specifier = '', arg = '', content = ''
    // color parameters are always first
    // we need to know how many color parameters
    // there are in `str`, in order to splice them from `params`
    // and proceed to iterate through the others.
    const colorMatch = str.match(/%c/g) || ''
    const colorCount = colorMatch.length
    const colorParams = params.splice(0, colorCount)

    for (var i = 0, len = str.length; i < len; i++) {
      if (str[i] === '%' && typeof str[i + 1] === 'string') {
        if (tag) {
          tokens.push({tag, content, arg, specifier})
          tag = ''
          content = ''
          arg = ''
          specifier = ''
        }

        tag = str[i] + str[i + 1]
        specifier = str[i + 1]
        arg = tag === '%c'
          ? colorParams.shift() || ''
          : params.shift() || ''
      }
      content += str[i]
    }

    if (content.length > 0) {
      tokens.push({
        tag: tag || '',
        content: content || '',
        arg: arg || '',
        specifier: specifier || ''
      })
    }

    return tokens
  }
}

module.exports = Formatter
