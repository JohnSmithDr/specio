'use strict';

const http = require('http');
const agent = require('./agent');
const utils = require('./utils');

const METHODS = ['head', 'options', 'delete', 'get', 'post', 'put', 'patch'];

function SpecioClient(spec) {

  this._spec = spec;
  this._scheme = Array.isArray(spec.schemes) ? spec.schemes[0] : 'http';
  this._host = spec.host || 'localhost';
  this._basePath = spec.basePath || '/';
  this._promiseConstructor = Promise;
  this._api = {};
  this._server = null;

  let paths = spec.paths || {};
  Object.keys(paths)
    .map(path => [ path, paths[path] ])
    .forEach(args => this._bindPath.apply(this, args));

}

SpecioClient.prototype = {

  _bindOperation: function (path, method, spec) {
    this._api[spec.operationId] = (function () {
      return this._proxy(path, method);
    }).bind(this);
  },

  _bindPath: function (path, spec) {
    METHODS
      .filter(method => spec[method])
      .map(method => ({ method, spec: spec[method] }))
      .forEach(x => this._bindOperation(path, x.method, x.spec));
  },

  /**
   * Proxy api.
   * @param {string} path
   * @param {string} method
   * @returns {superagent.Request}
   * @private
   */
  _proxy: function (path, method) {
    return agent[method](path)
      .basePath(this._basePath)
      .host(this._host)
      .scheme(this._scheme)
      .usePromise(this._promiseConstructor);
  },

  /**
   * Use specific promise constructor.
   * @param {Promise} promiseConstructor
   * @returns {SpecioClient}
   */
  usePromise: function (promiseConstructor) {

    if (!utils.isPromiseConstructor(promiseConstructor)) {
      throw Error('expected a promise constructor');
    }

    this._promiseConstructor = promiseConstructor;
    return this;
  },

  /**
   * @param {function} [app] - http request handler
   * @param {number} [port] - http port
   */
  useApp: function (app, port) {
    return new this._promiseConstructor((resolve, reject) => {
      this._server = http.createServer(app);
      this._host = `localhost:${port}`;
      this._server.listen(port, (err) => err ? reject(err) : resolve(this));
    });
  }

};

/**
 * Get api specification.
 */
Object.defineProperty(SpecioClient.prototype, 'spec', {
  get: function () {
    return this._spec;
  }
});

/**
 * Get api methods.
 */
Object.defineProperty(SpecioClient.prototype, 'api', {
  get: function () {
    return this._api;
  }
});

/**
 * @param {object} spec - API specification
 * @returns
 */
function specio(spec) {
  return new SpecioClient(spec);
}

specio.Client = SpecioClient;

module.exports = specio;
