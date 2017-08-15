'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isBrowser = require('./isBrowser');
var applyStyle = require('./applyStyle');
var stringifyObject = require('./stringifyObject');

var defaultFormatters = {
  c: function c(token) {
    return token.content;
  },
  d: function d(token) {
    if (isNaN(token.arg)) return token.content;
    var parsedValue = parseFloat(token.arg);
    return token.content.replace(token.tag, parsedValue);
  },
  i: function i(token) {
    if (isNaN(token.arg)) return token.content;
    var parsedValue = parseInt(token.arg, 10);
    return token.content.replace(token.tag, parsedValue);
  },
  o: function o(token) {
    if (_typeof(token.arg) !== 'object') return token.content;
    var parsedValue = stringifyObject(token.arg, {
      indent: '  ',
      inlineCharacterLimit: 32
    });
    return token.content.replace(token.tag, parsedValue);
  },
  O: function O(token) {
    if (_typeof(token.arg) !== 'object') return token.content;
    var parsedValue = stringifyObject(token.arg, {
      indent: '  ',
      inlineCharacterLimit: 12
    });
    return token.content.replace(token.tag, parsedValue);
  },
  s: function s(token) {
    return token.content.replace(token.tag, token.arg.toString());
  }
};

var defaultProps = {
  enableCodeMap: false,
  formatters: {},
  codeMap: {},
  disableCodeMap: false
};

var Formatter = function () {
  function Formatter(props) {
    _classCallCheck(this, Formatter);

    this.props = Object.assign({}, defaultProps, props);
    this._formatters = Object.assign({}, defaultFormatters, this.props.formatters);
    this._codeMap = Object.assign({}, this.props.codeMap);
  }

  _createClass(Formatter, [{
    key: 'format',
    value: function format(str) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if (args.length === 0) {
        return {
          stringValue: this.props.disableCodeMap ? str : this._replaceCodeMap(str),
          args: args
        };
      }

      var tokens = this._tokenize(str, args);
      var result = this._parseTokens(tokens);

      if (result.colorArgs.length > 0) args = result.colorArgs.concat(args);

      return {
        stringValue: this.props.disableCodeMap ? result.parsed : this._replaceCodeMap(result.parsed),
        args: args.length > 0 ? args : ''
      };
    }
  }, {
    key: '_parseTokens',
    value: function _parseTokens(tokens) {
      var _this = this;

      var parsed = '',
          colorArgs = [];

      tokens.forEach(function (token) {
        if (token.specifier === 'c') colorArgs.push(token.arg);

        if (_this._formatters[token.specifier]) {
          return parsed += _this._formatters[token.specifier](token);
        }

        parsed += token.content;
      });

      parsed = this._applyStyles(parsed, colorArgs);

      return {
        parsed: parsed,
        colorArgs: colorArgs
      };
    }
  }, {
    key: '_replaceCodeMap',
    value: function _replaceCodeMap(str) {
      if (!this._codeMap) return str;

      var re = /(:(.*?):)/g;
      var match = re.exec(str);

      while (match) {
        if (this._codeMap.hasOwnProperty(match[2])) {
          str = str.replace(match[1], this._codeMap[match[2]]);
        }
        match = re.exec(str);
      }

      return str;
    }
  }, {
    key: '_applyStyles',
    value: function _applyStyles(str, params) {
      if (params.length === 0) return str;

      var index = void 0,
          content = '';
      var colorMap = [];
      do {
        index = str.indexOf('%c');
        if (index === -1) continue;
        colorMap.push(index);
        str = str.slice(0, index) + str.slice(index + 2, str.length);
      } while (index >= 0);

      if (colorMap.length > 0 && colorMap.slice(-1)[0] < str.length) {
        colorMap.push(str.length);
      }

      for (var i = 0, len = colorMap.length; i < len; i++) {
        var left = colorMap[i];
        var right = colorMap[i + 1];

        var styles = params.length > 0 ? params.shift().toString().split('_') : [];
        var inner = str.slice(left, right);

        var applied = isBrowser ? applyStyle(styles) : applyStyle(styles, inner);

        if (i === 0 && left > 0) applied = str.slice(0, left) + applied;

        content += applied;
      }

      return content;
    }
  }, {
    key: '_tokenize',
    value: function _tokenize(str, params) {
      if (!str) return [];

      var tokens = [];
      var tag = '',
          specifier = '',
          arg = '',
          content = '';

      var colorMatch = str.match(/%c/g) || '';
      var colorCount = colorMatch.length;
      var colorParams = params.splice(0, colorCount);

      for (var i = 0, len = str.length; i < len; i++) {
        if (str[i] === '%' && typeof str[i + 1] === 'string') {
          if (tag) {
            tokens.push({ tag: tag, content: content, arg: arg, specifier: specifier });
            tag = '';
            content = '';
            arg = '';
            specifier = '';
          }

          tag = str[i] + str[i + 1];
          specifier = str[i + 1];
          arg = tag === '%c' ? colorParams.shift() || '' : params.shift() || '';
        }
        content += str[i];
      }

      if (content.length > 0) {
        tokens.push({
          tag: tag || '',
          content: content || '',
          arg: arg || '',
          specifier: specifier || ''
        });
      }

      return tokens;
    }
  }]);

  return Formatter;
}();

module.exports = Formatter;