"use strict";

const request = require('request');

module.exports = function() {
  let _args = Array.prototype.slice.call(arguments);
  return new Promise(function(resolve, reject) {
    _args.push(function(err, resp, body) {
      if (err) {
        return reject(err);
      }
      resp.body = body;
      resolve(resp);
    });
    return request.apply(request, _args)
  });
};

module.exports.request = request;