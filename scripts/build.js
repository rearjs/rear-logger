process.env.NODE_ENV = 'production'

const chokidar = require('chokidar')
const rimrafSync = require('rimraf').sync
const paths = require('../config/paths')
const log = require('./lib/log')
const transpile = require('./lib/transpile')
const lintFiles = require('./lib/linter')
const runFlow = require('./lib/runFlow')

// we still poll in production so if any
// error arise we can fix it before
// the build completes.
const watcherConfig = {
  alwaysStat: true,
  usePolling: true,
  interval: 300,
  ignored: /((^|[/\\])\.|.+\.(?!(js*)$)([^.]+$))/
}

let watcher
let watchedFiles = []

function main () {
  rimrafSync(paths.distDir)
  build()
}

function build () {
  log('info', 'Compiling...')
  watcher = chokidar.watch(paths.srcDir, watcherConfig)

  watcher.on('add', handleWatcherAdd)
  watcher.on('ready', handleWatcherChanges)
  watcher.on('change', handleWatcherChanges)
}

function handleWatcherAdd (filepath, stats) {
  watchedFiles.push(filepath)
}

function handleWatcherChanges () {
  let success = lintFiles(watchedFiles)
  if (success) {
    log('info', 'Type checking...')
    runFlow().then((code) => {
      if (code > 1) {
        log('error', 'Compile failed')
        return
      }
      log('info', 'Compiling...')
      return compile().then(() => watcher.close())
    }).catch(printError)
  }
}

function compile () {
  return new Promise((resolve, reject) => {
    watchedFiles.forEach(file => {
      return transpile(file).catch(printError)
    })

    printSuccess()
    resolve()
  })
}

function printSuccess () {
  log('clear')
  log('success', 'Production build compiled successfully!')
}

function printError (err) {
  log('clear')
  log('error', 'Compile failed: ' + err.message)
}

if (require.main !== 'undefined') main()
