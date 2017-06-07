const { spawn } = require('child_process')
const flow = require('flow-bin')

module.exports = () => {
  return new Promise((resolve, reject) => {
    const cmd = spawn(flow, [], {stdio: 'inherit'})
    cmd.on('exit', (code, signal) => resolve(code))
  })
}
