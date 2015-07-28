"use strict";

const co = require('co');
const qs = require('querystring');
const URL = require('url');
const moment = require('moment');
const $ = require('@whym/dollar');
const _ = require('lodash');

class CacheObject {

  constructor(response) {
    if (_.isString(response)) {
      this.statusCode = 200;
      this.headers = {};
      this.body = response;
    } else {
      this.statusCode = response.statusCode || 200;
      this.headers = response.headers;
      this.body = response.body;
    }
    this.createdTime = response.cacheTime || moment().unix();
  }

  json() {
    return JSON.stringify(this);
  }

  save(targetOpts) {
    let self = this;
    let key = CacheObject.key(targetOpts);
    let client = sand.cache.getCacheClient();
    return co(function *() {
      sand.cache.logOp('SET ' + key);
      return yield client.save(key, self);
    });
  }

  static getUrl(targetOpts) {
    let url = _.isString(targetOpts) ? targetOpts : ( (targetOpts.url || targetOpts.uri) + '?' + qs.encode(targetOpts.qs || targetOpts.query || {}) );
    if (!URL.parse(url).host) { // be sure it has a host
      return null;
    }
    return url;
  }

  static getCacheOpts(cacheOpts) {
    return _.merge({}, sand.cache.config.defaultCacheOpts, cacheOpts || {});
  }

  static key(targetOpts) {
    return sand.cache.config.cacheKey(targetOpts);
  }

  static formattedCacheKey(targetOpts) {
    return sand.cache.config.formattedCacheKey(targetOpts);
  }

  static fetch(targetOpts, cacheOpts) {
    return co(function *() {
      cacheOpts = CacheObject.getCacheOpts(cacheOpts);

      let client = sand.cache.getCacheClient();
      let key = CacheObject.key(targetOpts);

      sand.cache.logOp('GET ' + key);

      try {
        let obj = yield client.get(key);

        if (!obj) {
          return null;
        }

        if (_.isString(obj)) {
          obj = JSON.parse(obj);
        }

        console.log(moment().unix(), parseInt(obj.createdTime || 0), parseInt(cacheOpts.ttl), moment().unix() - parseInt(obj.createdTime || 0) > parseInt(cacheOpts.ttl))
        if (moment().unix() - parseInt(obj.createdTime || 0) > parseInt(cacheOpts.ttl)) {
          if (cacheOpts.deleteIfExpired) {
            yield client.delete(key);
          }

          return null;
        }

        if (cacheOpts.bodyOnly) {
          obj = obj.body;

        } else if (obj.headers) {
          obj.headers['x-from-cache'] = 1;
        }

        return obj;

      } catch (e) {
        //sand.cache.log('err', e.stack);
        return null;
      }

    });
  }
}

module.exports = CacheObject;