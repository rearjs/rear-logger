/* @flow */
const isBrowser = require('./isBrowser')
const ansiStyles = require('ansi-styles')
const cssStyles = require('./cssStyles')

function applyStyle (styles: Array<string>, str?: string): string {
  let i = styles.length

  if (isBrowser) {
    const css = []
    while (i--) {
      const style = cssStyles[styles[i]]
      if (style) css.push(style)
    }
    return '{' + css.join('; ') + '}'
  }

  let string = str || ''
  const originalDim = ansiStyles.dim.open;

  while (i--) {
    var code = ansiStyles[styles[i]];
    if (!code) continue

		// Replace any instances already present with a re-opening code
		// otherwise only the part of the string until said closing code
		// will be colored, and the rest will simply be 'plain'.
		string = code.open + string.replace(code.closeRe, code.open) + code.close;

		// Close the styling before a linebreak and reopen
		// after next line to fix a bleed issue on macOS
		// https://github.com/chalk/chalk/pull/92
		string = string.replace(/\r?\n/g, code.close + '$&' + code.open);
  }

  // Reset the original 'dim' if we changed it to work around the Windows dimmed gray issue.
	ansiStyles.dim.open = originalDim;

	return string
}

module.exports = applyStyle
