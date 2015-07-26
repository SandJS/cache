"use strict";

const CacheObject = require('../..').CacheObject;
const co = require('co');

module.exports = {
  save: function(cacheKey, value) {
    return co(function *() {
      let resp;
      if (sand.cache.config.cacheNamespace) {
        resp = yield sand.riak.save(sand.cache.config.cacheNamespace, cacheKey, value);
      } else {
        resp = yield sand.riak.save(cacheKey, value);
      }

      return resp;
    });
  },

  get: function(cacheKey) {
    return co(function *() {
      let resp;
      if (sand.cache.config.cacheNamespace) {
        resp = yield sand.riak.get(sand.cache.config.cacheNamespace, cacheKey);
      } else {
        resp = yield sand.riak.get(cacheKey);
      }

      resp = resp[1];

      if (200 != resp.statusCode) {
        throw new Error('STATUS ' + resp.statusCode + ' ' + sand.cache.config.cacheNamespace + '/' + cacheKey + ' BODY ' + resp.body);
      }

      let obj = new CacheObject(resp);
      obj = JSON.parse(obj.body);
      return obj;
    });
  },

  delete: function(cacheKey) {
    return co(function *() {
      let resp;
      if (sand.cache.config.cacheNamespace) {
        resp = yield sand.riak.delete(sand.cache.config.cacheNamespace, cacheKey);
      } else {
        resp = yield sand.riak.delete(cacheKey);
      }

      return resp;
    });
  }
};