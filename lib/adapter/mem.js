"use strict";

let db = {};

module.exports = {
  save: function(key, value) {
    db[cacheKey(key)] = value;
    return Promise.resolve('ok');
  },
  get: function(key) {
    return Promise.resolve(db[cacheKey(key)]);
  },
  delete: function(key) {
    delete db[cacheKey(key)];
    return Promise.resolve('ok');
  }
};

function cacheKey(cacheKey) {
  return sand.cache.config.cacheNamespace + ':' + cacheKey;
}