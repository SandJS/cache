const sand = require('sand');
const http = require('sand-http');
const cache = require('../..');

module.exports = new sand({appPath: __dirname, log: '*,-cache:op'}).use(cache).use(http).start();