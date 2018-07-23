module.exports = isBrowserMock

////////////////////////////////

function isBrowserMock () {
  return process.env.REARTEST_IS_BROWSER;
}