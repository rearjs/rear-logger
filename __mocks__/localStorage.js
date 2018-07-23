function LocalStorageMock () {
  this.store = {}
}

LocalStorageMock.prototype.getItem = function (key) {
  return this.store[key];
}

LocalStorageMock.prototype.setItem = function (key, value) {
  this.store[key] = value;
}

LocalStorageMock.prototype.removeItem = function (key) {
  delete this.store[key];
}

LocalStorageMock.prototype.clear = function () {
  this.store = {}
}

module.exports = LocalStorageMock;