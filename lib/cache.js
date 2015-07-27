"use strict";

const SandGrain = require('sand-grain');
const co = require('co');
const path = require('path');
const _ = require('lodash');
const $ = require('@whym/dollar');

const request = require('./request');
const CacheObject = require('./CacheObject');

class Cache extends SandGrain {

  constructor() {
    super();
    this.name = this.configName = 'cache';
    this.defaultConfig = require('./default');
    this.version = require('../package').version;
  }

  init(config, done) {
    super.init(config);
    this.logOp = this.log.as('cache:op');
    done();
  }

  getCacheClient() {
    if (_.isString(this.config.cacheAdapter)) {
      try {
        return require(path.join(__dirname, 'adapter', this.config.cacheAdapter));
      } catch (e) {
        throw new Error(`Unknown cache adapter '${this.config.cacheAdapter}' not found.`)
      }
    } else {
      if (!this.config.cacheAdapter) {
        throw new Error('Cache adapter config is not set.');
      }

      if (
        !_.isFunction(this.config.cacheAdapter.get) ||
        !_.isFunction(this.config.cacheAdapter.save) ||
        !_.isFunction(this.config.cacheAdapter.delete)) {
        throw new Error(`Cache adapter must implement 'get', 'save', and 'delete'`);
      }

      return this.config.cacheAdapter;
    }
  }

  getUrlFromRequest(req) {
    return req.protocol + '://' + req.get('host') + req.originalUrl;
  }

  fetchAndSave(targetOpts, cacheOpts) {
    let self = this;
    return co(function *() {

      let url = CacheObject.getUrl(targetOpts);
      if (!url) {
        throw new Error('No url given');
      }

      let formattedCacheKey = CacheObject.formattedCacheKey(targetOpts);

      let cached = yield self.fetch(targetOpts, cacheOpts);

      if (cached) {
        self.log('CACHE ' + formattedCacheKey);
        return cached;
      }

      let resp = yield request(targetOpts);

      if (resp.statusCode != 200) {
        self.log('ERROR ' + formattedCacheKey);
        return resp;
      }

      yield self.save(targetOpts, resp);

      self.log('FRESH ' + formattedCacheKey);

      let result = yield self.fetch(targetOpts, cacheOpts);
      return result;

    });

  }

  fetch(targetOpts, cacheOpts) {
    return co(function *() {
      return yield CacheObject.fetch(targetOpts, cacheOpts);
    });
  }

  save(targetOpts, response) {
    return co(function *() {
      return yield new CacheObject(response).save(targetOpts);
    });
  }

  delete(targetOpts) {
    let self = this;
    return co(function *() {
      let client = self.getCacheClient();
      let key = CacheObject.key(targetOpts);
      return yield client.delete(key);
    });
  }

  isLocked(targetOpts, cacheOpts) {
    let self = this;
    return co(function *() {
      let lock = yield self.fetch(targetOpts + '-lock', cacheOpts);
      return !!lock;
    });
  }

  acquireLock(targetOpts, cacheOpts) {
    let self = this;
    return co(function *() {
      if (self.isLocked(targetOpts, cacheOpts)) {
        return false;
      }
      return self.save(targetOpts + '-lock', '1');
    });
  }

  releaseLock(targetOpts) {
    let self = this;
    return co(function *() {
      return yield self.delete(targetOpts + '-lock');
    });
  }

}

module.exports = Cache;

Cache.CacheObject = CacheObject;