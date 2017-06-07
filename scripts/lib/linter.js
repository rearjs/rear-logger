const pkg = require('../../package.json')
const chalk = require('chalk')
const CLIEngine = require('eslint').CLIEngine
const log = require('./log')

const eslintCLI = new CLIEngine(pkg.eslintConfig)

module.exports = (files) => {
  const report = eslintCLI.executeOnFiles(files)
  if (report.errorCount > 0 || report.warningCount > 0) {
    printLintReportResults(report)
    return false
  }
  return true
}

function printLintReportResults (report) {
  const results = report.results.filter(child => {
    return child.errorCount || child.warningCount
  })

  if (results.length > 0) {
    const result = results[0]
    log('clear')
    log('error', 'Compile failed')
    console.log()
    console.log(eslintFormatFilePath(result.filePath))
    result.messages.forEach((message) => {
      console.log(eslintFormatResult(message))
    })
    console.log(eslintFormatProblems(report))
  }
}

function eslintFormatFilePath (filepath) {
  return chalk.bold.underline.white(filepath)
}

function eslintFormatResult (result) {
  let levelLabel
  switch (result.severity) {
    case 1:
      levelLabel = chalk.bold.yellow('warning')
      break
    case 2:
      levelLabel = chalk.bold.red('error')
      break
    default:
      levelLabel = chalk.bold.cyan('info')
      break
  }

  const normalizeNum = (num) => {
    if (num < 10) return '0' + num
    return num
  }

  const errorPosition = chalk.grey(normalizeNum(result.line) + ':' + normalizeNum(result.column))
  const rule = chalk.gray(result.ruleId)
  return '  ' + errorPosition + '  ' + levelLabel + '  ' + result.message + '  ' + rule
}

function eslintFormatProblems (report) {
  const { errorCount, warningCount } = report
  const totals = errorCount + warningCount
  return '  ' + chalk.bold.red(
    totals + ' problems (' + errorCount + ' errors, ' + warningCount +
    ' warnings)'
  )
}
