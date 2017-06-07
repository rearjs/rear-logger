const RearLogger = require('./lib/RearLogger')

module.exports = function createLogger (name, props) {
  return new RearLogger(name, props)
}
