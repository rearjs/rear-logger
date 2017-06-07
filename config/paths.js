const path = require('path')
const fs = require('fs')

// Make sure any symlinks in the project folder are resolved:
const appDirectory = fs.realpathSync(process.cwd())

function resolveApp (relativePath) {
  return path.resolve(appDirectory, relativePath)
}

// Support resolving modules according to `NODE_PATH`.
// This lets you use absolute paths in imports inside large monorepos:

// It works similar to `NODE_PATH` in Node itself:

// We will export `nodePaths` as an array of absolute paths.
// It will then be used by Webpack configs.
// Jest doesn’t need this because it already handles `NODE_PATH` out of the box.

const nodePaths = (process.env.NODE_PATH || '')
  .split(process.platform === 'win32' ? ';' : ':')
  .filter(Boolean)
  .map(resolveApp)

// Define the paths

const Paths = {
  testDir: resolveApp('__tests__'),
  srcDir: resolveApp('src'),
  distDir: resolveApp('lib'),
  indexJs: resolveApp('index.js'),
  envFile: resolveApp('.env'),
  appNodeModules: resolveApp('node_modules'),
  ownNodeModules: resolveApp('node_modules'),
  nodePaths: nodePaths
}

module.exports = Paths
