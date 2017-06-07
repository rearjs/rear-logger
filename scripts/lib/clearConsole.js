let isFirstClear = true

module.exports = () => {
  let code = '\x1b[2J\x1b[0f'
  if (isFirstClear) {
    code = '\x1bc'
    isFirstClear = false
  }
  console.log(code)
}
