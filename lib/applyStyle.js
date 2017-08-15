'use strict';

var isBrowser = require('./isBrowser');
var ansiStyles = require('ansi-styles');
var cssStyles = require('./cssStyles');

function applyStyle(styles, str) {
  var i = styles.length;

  if (isBrowser) {
    var css = [];
    while (i--) {
      var style = cssStyles[styles[i]];
      if (style) css.push(style);
    }
    return '{' + css.join('; ') + '}';
  }

  var string = str || '';
  var originalDim = ansiStyles.dim.open;

  while (i--) {
    var code = ansiStyles[styles[i]];
    if (!code) continue;

    string = code.open + string.replace(code.closeRe, code.open) + code.close;

    string = string.replace(/\r?\n/g, code.close + '$&' + code.open);
  }

  ansiStyles.dim.open = originalDim;

  return string;
}

module.exports = applyStyle;