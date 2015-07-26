"use strict";

let db = {};

module.exports = {
  save: function(cacheKey, value) {
    db[cacheKey] = value;
    return Promise.resolve('ok');
  },
  get: function(cacheKey) {
    return Promise.resolve(db[cacheKey]);
  },
  delete: function(cacheKey) {
    delete db[cacheKey];
    return Promise.resolve('ok');
  }
}