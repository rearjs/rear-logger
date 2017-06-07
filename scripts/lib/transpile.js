const fs = require('fs')
const path = require('path')
const babel = require('babel-core')
const paths = require('../../config/paths')

const defaultBabelConfig = {
  comments: false,
  compact: true
}

module.exports = (file, options) => {
  const babelOptions = Object.assign({}, defaultBabelConfig, options)
  return new Promise((resolve, reject) => {
    babel.transformFile(file, babelOptions, (err, result) => {
      if (err) return reject(err)

      const destfile = file.replace(paths.srcDir, paths.distDir)
      const destdir = path.dirname(destfile)

      if (!fs.existsSync(destdir)) fs.mkdirSync(destdir)

      fs.writeFile(destfile, result.code, (err) => {
        if (err) return reject(err)
        resolve(destfile)
      })
    })
  })
}
