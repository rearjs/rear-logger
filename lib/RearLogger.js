'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var isBrowser = require('./isBrowser');
var emoji = require('./emoji');
var Formatter = require('./Formatter');
var levels = require('./levels');
var TTYCodes = require('./ttyCodes');

var defaultProps = {
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
};

var RearLogger = function () {
  function RearLogger(name, props) {
    _classCallCheck(this, RearLogger);

    if (!name) {
      throw new ReferenceError('Show some love for your logger. Give it a name!');
    }

    this.name = name;
    this.props = Object.assign({}, defaultProps, props);

    this._formatter = new Formatter({
      formatters: this.props.formatters,
      codeMap: this.props.codeMap,
      disableCodeMap: this.props.disableCodeMap
    });

    this._levels = Object.assign({}, levels, this.props.levels);
    this._firstClear = true;

    var rnd = function rnd(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    };
    var colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan'];
    var rndNum = rnd(0, colors.length - 1);
    var rndColor = colors[rndNum] + '';
    this._loggerName = this._formatter.format('%c' + this.name + ':', rndColor).stringValue;

    build(this._levels, this);
  }

  _createClass(RearLogger, [{
    key: 'raw',
    value: function raw(message) {
      if (!this.props.enabled) return;

      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      this._stdout(false, message, args);
    }
  }, {
    key: 'message',
    value: function message(level, _message) {
      var _formatter;

      if (!this.props.enabled) return;
      this._updateTimestamps();

      var log = void 0,
          pad = ' ',
          prefix = '';
      switch (level) {
        case 'warn':
        case 'warning':
          log = this._stdwarn.bind(this);
          break;
        case 'error':
          log = this._stderr.bind(this);
          break;
        default:
          log = this._stdout.bind(this);
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      if (!_message && args.length === 0) return log(true, '');

      var formatted = (_formatter = this._formatter).format.apply(_formatter, [_message].concat(args));

      if (this.props.showLevelName && typeof level === 'string' && level !== 'none') {
        prefix = this._formatter.format('%c' + level, this._levels[level] || 'white').stringValue + pad;
      }

      var timeLabel = this.props.showTimeLabel ? this._timeLabel() + pad : '';
      var diffLabel = this.props.showDiffLabel ? this._diffLabel() + pad : '';
      var formattedMessage = this.props.showDiffLabel ? formatted.stringValue + pad : formatted.stringValue;
      var loggerName = this.props.showName ? this._loggerName + pad : '';

      log(true, '' + loggerName + timeLabel + prefix + formattedMessage + diffLabel, formatted.args);
    }
  }, {
    key: 'log',
    value: function log(message) {
      var _message2;

      for (var _len3 = arguments.length, args = Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
        args[_key3 - 1] = arguments[_key3];
      }

      return (_message2 = this.message).call.apply(_message2, [this, 'none', message || ''].concat(args));
    }
  }, {
    key: 'warn',
    value: function warn() {
      var _message3;

      for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
        args[_key4] = arguments[_key4];
      }

      if (!args) return;
      if (typeof args[0] === 'boolean' && !args[0]) return;

      var message = '';

      if (typeof args[0] === 'boolean' && typeof args[1] === 'string') {
        args.splice(0, 1);
      }

      var firstArg = args.splice(0, 1);
      message = firstArg[0];

      return (_message3 = this.message).call.apply(_message3, [this, 'warn', message || ''].concat(args));
    }
  }, {
    key: 'error',
    value: function error(message) {
      var _message4;

      if (message instanceof Error) {
        this.message.call(this, 'error', message.message || '');
        this.message.call(this, 'none', message.stack.split('\n').slice(1).join('\n') || '');
        return;
      }

      if ((typeof message === 'undefined' ? 'undefined' : _typeof(message)) === 'object' && message.hasOwnProperty('message')) {
        message = message.message;
      }

      for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
        args[_key5 - 1] = arguments[_key5];
      }

      return (_message4 = this.message).call.apply(_message4, [this, 'error', message || ''].concat(args));
    }
  }, {
    key: 'highlight',
    value: function highlight(message) {
      var _formatter2;

      for (var _len6 = arguments.length, args = Array(_len6 > 1 ? _len6 - 1 : 0), _key6 = 1; _key6 < _len6; _key6++) {
        args[_key6 - 1] = arguments[_key6];
      }

      var formatArgs = args.length > 0 ? ['bold_white'].concat(args) : ['bold_white'];
      var formatted = (_formatter2 = this._formatter).format.apply(_formatter2, ['%c' + message].concat(_toConsumableArray(formatArgs)));
      var timeLabelSetting = this.props.showTimeLabel;
      var diffLabelSetting = this.props.showDiffLabel;
      this.props.showTimeLabel = false;
      this.props.showDiffLabel = false;
      this.message.call(this, 'none', formatted.stringValue);
      this.props.showTimeLabel = timeLabelSetting;
      this.props.showDiffLabel = diffLabelSetting;
    }
  }, {
    key: 'clear',
    value: function clear() {
      if (!this.props.enabled) return;
      if (isBrowser) {
        if (typeof console !== 'undefined' && console.clear) {
          console.clear();
          return;
        }
      }

      var code = this._isFirstClear ? TTYCodes.FIRST_CLEAR : TTYCodes.CLEAR;
      return this.raw(code);
    }
  }, {
    key: 'clearLine',
    value: function clearLine() {
      return this.rewriteLine(0);
    }
  }, {
    key: 'rewriteLine',
    value: function rewriteLine(lines, clear) {
      if (!this.props.enabled || isBrowser) return;
      var rewrite = TTYCodes.MOVE_LEFT;
      for (var i = 0; i < lines; i++) {
        rewrite += TTYCodes.MOVE_UP + (clear ? TTYCodes.CLEAR_LINE : '');
      }
      rewrite += TTYCodes.CLEAR_LINE;
      return this.raw(rewrite);
    }
  }, {
    key: 'hideCursor',
    value: function hideCursor() {
      if (!this.props.enabled || isBrowser) return;
      var ansiEscape = '\x1B[?25l';
      return this.raw(ansiEscape);
    }
  }, {
    key: 'showCursor',
    value: function showCursor() {
      if (!this.props.enabled || isBrowser) return;
      var ansiEscape = '\x1B[?25h';
      return this.raw(ansiEscape);
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '[RearLogger ' + this.name + ']';
    }
  }, {
    key: '_stdout',
    value: function _stdout(postfix, str) {
      for (var _len7 = arguments.length, args = Array(_len7 > 2 ? _len7 - 2 : 0), _key7 = 2; _key7 < _len7; _key7++) {
        args[_key7 - 2] = arguments[_key7];
      }

      if (typeof this.props.stdout === 'function') {
        var _props;

        (_props = this.props).stdout.apply(_props, [str].concat(args));
      } else if (isBrowser) {
        if (typeof console !== 'undefined') {
          var _console;

          (_console = console).log.apply(_console, [str].concat(args));
        }
      } else {
        var message = str + args.join();
        if (postfix) message += '\n';
        process.stderr.write(message);
      }
    }
  }, {
    key: '_stderr',
    value: function _stderr(postfix, str) {
      for (var _len8 = arguments.length, args = Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
        args[_key8 - 2] = arguments[_key8];
      }

      args = args || [];
      if (typeof this.props.stderr === 'function') {
        var _props2;

        (_props2 = this.props).stderr.apply(_props2, [str].concat(_toConsumableArray(args)));
      } else if (isBrowser) {
        if (typeof console !== 'undefined') {
          var _console2;

          (_console2 = console).error.apply(_console2, [str].concat(_toConsumableArray(args)));
        }
      } else {
        var message = str + args.join();
        if (postfix) message += '\n';
        process.stderr.write(message);
      }
    }
  }, {
    key: '_stdwarn',
    value: function _stdwarn(postfix, str) {
      for (var _len9 = arguments.length, args = Array(_len9 > 2 ? _len9 - 2 : 0), _key9 = 2; _key9 < _len9; _key9++) {
        args[_key9 - 2] = arguments[_key9];
      }

      args = args || [];
      if (typeof this.props.stdout === 'function') {
        var _props3;

        (_props3 = this.props).stdout.apply(_props3, [str].concat(_toConsumableArray(args)));
      } else if (isBrowser) {
        if (typeof console !== 'undefined' && console.warn) {
          var _console3;

          (_console3 = console).warn.apply(_console3, [str].concat(_toConsumableArray(args)));
        }
      } else {
        var message = str + args.join();
        if (postfix) message += '\n';
        process.stdout.write(message);
      }
    }
  }, {
    key: '_diffLabel',
    value: function _diffLabel() {
      var style = this._levels.hasOwnProperty('diffLabel') ? this._levels.diffLabel : 'dim_white';

      var label = void 0;
      var diff = this._timestamps.diff;

      if (diff < 1000) {
        label = '+' + diff + 'ms';
      } else if (diff < 60000) {
        label = '+' + (diff / 1000).toFixed(2) + 's';
      } else {
        label = parseInt(diff / 1000 / 60, 10) + 'h';
      }

      return this._formatter.format('%c' + label, style).stringValue;
    }
  }, {
    key: '_timeLabel',
    value: function _timeLabel() {
      var style = this._levels.hasOwnProperty('diffLabel') ? this._levels.timeLabel : 'dim_white';

      var date = new Date(this._timestamps.current);
      var normalize = function normalize(num, f) {
        return num < f ? '0' + num : num;
      };
      var hh = normalize(date.getHours(), 10);
      var mm = normalize(date.getMinutes(), 10);
      var ss = normalize(date.getSeconds(), 10);
      var ms = normalize(date.getMilliseconds(), 100);

      return this._formatter.format('%c[' + hh + ':' + mm + ':' + ss + '.' + ms + ']', style).stringValue;
    }
  }, {
    key: '_updateTimestamps',
    value: function _updateTimestamps() {
      var current = +new Date();

      if (!this._timestamps) {
        this._timestamps = {
          current: current,
          last: current,
          diff: 0
        };
        return;
      }

      var last = this._timestamps.current;
      this._timestamps = {
        current: current,
        last: last,
        diff: current - last
      };
    }
  }]);

  return RearLogger;
}();

function build(src, dest) {
  for (var prop in src) {
    if (src.hasOwnProperty(prop)) {
      var propType = _typeof(src[prop]);
      if (propType === 'string' && typeof dest[prop] === 'undefined') {
        dest[prop] = createLogFunction(dest, prop);
      }
    }
  }
}

function createLogFunction(builder, prop) {
  return function log(message) {
    var _builder$message;

    for (var _len10 = arguments.length, args = Array(_len10 > 1 ? _len10 - 1 : 0), _key10 = 1; _key10 < _len10; _key10++) {
      args[_key10 - 1] = arguments[_key10];
    }

    return (_builder$message = builder.message).call.apply(_builder$message, [builder, prop, message].concat(args));
  };
}

module.exports = RearLogger;