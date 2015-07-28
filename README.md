# Sand Cache
Sand caching plugin.

## Config
| Option | Type | Description | 
|--------|------|-------------|
| cacheAdapter | string \| object | The name of the adapter object to use (`mem`, `riak`, `datastore`, or a custom object)
| cacheNamespace | string | The namespace for the cache data
| defaultCacheOpts.ttl | integer | Time to live used in `sand.cache.fetch(key, cacheOpts)`
| defaultCacheOpts.deleteIfExpired | boolean | If `sand.cache.fetch(key, cacheOpts)` finds that the key is expired delete immediately
| defaultCacheOpts.bodyOnly | boolean | Return the body only (excluding any other cache metadata, just the value)

## sand.cache
### sand.datastore.fetchAndSave(targetOpts, cacheOpts)
Target opts is designed to be passed straight to [request.js](https://github.com/request/request). The request will be executed if there is no cache found, otherwise the cache will be returned provided the cache opt constraints are matched.
