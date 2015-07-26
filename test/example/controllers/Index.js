"use strict";

const Controller = require('sand-http').Controller;

class Index extends Controller {

  static *index() {
    this.status(200).send('A-OK');
  }

}

module.exports = Index;