"use strict";

const request = require('request');
const _ = require('lodash');
const co = require('co');

describe('Cache', function() {

  before(function(done) {
    let app = require('./example/app');
    app.on('start', done);
  });

  describe('Client', function() {

    describe('Adapters', function() {

      let oldConfig;
      before(function() {
        oldConfig = _.cloneDeep(sand.cache.config);
      });

      after(function() {
        sand.cache.config = oldConfig;
      });

      _.each([
        null,
        undefined,
        '',
        false,
        {},
        {get: '', set: '', delete: ''},
        {get: function() {}, set: {}}
      ], function(val) {
        it('should reject ' + JSON.stringify(val), function() {
          sand.cache.config = _.merge({}, {cacheAdapter: val});
          (function () {
            sand.cache.getCacheClient();
          }).should.throw();
        });
      });

      let validAdapters = _.merge(
        {custom: {get: function() {}, save: function() {}, delete: function() {}}}
        , require('require-all')({
            dirname: __dirname + '/../lib/adapter',
            filter: /(\w+)\.js$/
          }));

      _.each(validAdapters, function(adapter, name) {
        it(`should accept '${name}' adapter`, function (done) {
          sand.cache.config = _.merge({}, oldConfig, {cacheAdapter: adapter});
          sand.cache.getCacheClient();
          done();
        });
      });

    });

    describe('Basic Operations', function() {

      var client;
      var cacheKey = 'mykey';
      var cacheVal = 'asdf';

      before(function() {
        sand.cache.config.cacheAdapter = 'mem';
        client = sand.cache.getCacheClient();
      });

      it('should save', function(done) {
        co(function *() {
          let result = yield client.save(cacheKey, cacheVal);
          result.should.be.eql('ok');
          result = yield client.get(cacheKey);
          result.should.be.eql(cacheVal);
          done();
        });
      });

      it('should get', function(done) {
        co(function *() {
          let result = yield client.get(cacheKey);
          result.should.be.eql(cacheVal);
          done();
        });
      });

      it('should delete', function(done) {
        co(function *() {
          let result = yield client.delete(cacheKey)
          result.should.be.eql('ok');
          result = yield client.get(cacheKey);
          (result === undefined).should.be.ok;
          done();
        });
      });

    });

  });

  describe('Methods', function() {

    before(function() {
      sand.cache.config.cacheAdapter = 'mem';
    });

    describe('#fetchAndSave', function() {

      _.each([null, undefined, false, true, 0, '', '/xyz', {}, {qs: ''}], function(val) {
        it('should reject ' + JSON.stringify(val), function(done) {
          co(function *() {
            try {
              yield sand.cache.fetchAndSave(val);
            } catch(e) {
              done();
            }
          });
        });
      });

      _.each([
        {url: 'http://127.0.0.1:9999/'},
        {uri: 'http://127.0.0.1:9999/'},
        'http://127.0.0.1:9999/'
      ], function(val) {
        it('should accept ' + JSON.stringify(val), function(done) {
          co(function *() {
            try {
              let result = yield sand.cache.fetchAndSave(val);
              console.log(result)
              'A-OK'.should.eql(result);
              done();

            } catch(e) {
              console.log(e.stack);
              throw e;
            }
          }).catch(function(e) {
            throw e;
          });
        });
      });
    });

  });

});