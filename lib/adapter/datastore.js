"use strict";

const KindName = 'Cache';

module.exports = {
  save: function(cacheKey, value) {
    return co(function *() {
      value = JSON.stringify(value);
      let result = yield sand.datastore.kind(KindName, sand.cache.config.cacheNamespace).save(cacheKey, { value: value });
      sand.datastore.log('save', result);
      return result;
    });
  },

  get: function(cacheKey) {
    return co(function *() {
      let result = yield sand.datastore.kind(KindName, sand.cache.config.cacheNamespace).get(cacheKey);
      sand.datastore.log('get', result);
      return JSON.parse(result.value);
    });
  },

  delete: function(cacheKey) {
    return co(function *() {
      let result = yield sand.datastore.kind(KindName, sand.cache.config.cacheNamespace).delete(cacheKey);
      sand.datastore.log('delete', result);
      return result;
    });
  }
};