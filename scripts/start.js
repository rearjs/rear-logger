process.env.NODE_ENV = 'development'

const chokidar = require('chokidar')
const rimrafSync = require('rimraf').sync
const paths = require('../config/paths')
const log = require('./lib/log')
const transpile = require('./lib/transpile')
const lintFiles = require('./lib/linter')
const runFlow = require('./lib/runFlow')

const watcherConfig = {
  alwaysStat: true,
  usePolling: true,
  interval: 300,
  ignored: /((^|[/\\])\.|.+\.(?!(js*)$)([^.]+$))/
}

const babelOptions = {
  compact: false
}

let watcher
let watchedFiles = []

function main () {
  rimrafSync(paths.distDir)
  watch()
}

function watch () {
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
      compile()
    }).catch(printError)
  }
}

function compile (filepath) {
  return new Promise((resolve, reject) => {
    if (filepath) {
      return transpile(filepath, babelOptions)
        .then(printSuccess)
        .catch(printError)
    }

    watchedFiles.forEach(file => {
      return transpile(file, babelOptions).catch(printError)
    })

    printSuccess()
    resolve()
  })
}

function printSuccess () {
  log('clear')
  log('success', 'Compiled successfully!')
}

function printError (err) {
  log('clear')
  log('error', 'Compile failed: ' + err.message)
}

if (require.main !== 'undefined') main()
