"use strict";

const $ = require('@whym/dollar');
const URL = require('url');
const CacheObject = require('./CacheObject');

module.exports = {
  cacheAdapter: 'riak',
  cacheNamespace: '',
  defaultCacheOpts: {
    ttl: 300,
    deleteIfExpired: true,
    bodyOnly: true
  },
  cacheKey: function(targetOpts) {
    let url = CacheObject.getUrl(targetOpts);
    let host = URL.parse(url).hostname;
    return host + '-' + $.sha1(JSON.stringify({url: url}));
  },
  formattedCacheKey: function(targetOpts) {
    return CacheObject.key(targetOpts);
  }
};

/*
 let client = sand.cache.getCacheClient();

 return URL.format({
   protocol: client.config.protocol || 'http',
   hostname: client.config.host,
   port: client.config.port || 80,
   pathname: `/buckets/${sand.cache.config.cacheNamespace}/keys/${key}`
 });
 */