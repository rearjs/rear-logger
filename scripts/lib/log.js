const chalk = require('chalk')
const clearConsole = require('./clearConsole')

let last, current
module.exports = (event, message, ...data) => {
  const now = new Date().getTime()

  if (!current && !last) {
    last = now
    current = now
  }

  last = current
  current = now

  const diffLabel = getDiffLabel(current - last)
  const timeLabel = getTimeLabel(current)

  let eventLabel
  switch (event) {
    case 'clear':
      return clearConsole()
    case 'info':
      eventLabel = chalk.cyan(event)
      break
    case 'success':
    case 'added':
      eventLabel = chalk.green(event)
      break
    case 'warning':
    case 'changed':
      eventLabel = chalk.yellow(event)
      break
    case 'error':
    case 'removed':
      eventLabel = chalk.red(event)
      break
    default:
      eventLabel = chalk.white(event)
  }

  console.log(timeLabel + ' ' + eventLabel + ' ' + message + ' ' + diffLabel, ...data)
}

function getTimeLabel (time) {
  const now = new Date(time)
  const hours = now.getHours()
  const min = now.getMinutes()
  const sec = now.getSeconds()

  const norm = (num) => num < 10 ? '0' + num : num
  return chalk.dim.white('[' + norm(hours) + ':' + norm(min) + ':' + norm(sec) + ']')
}

function getDiffLabel (time) {
  return chalk.dim.white('+' + (time / 1000).toFixed(2) + 's')
}
