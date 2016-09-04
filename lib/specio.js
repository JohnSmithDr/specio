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
  this._apiKey = '';

  let paths = spec.paths || {};
  Object.keys(paths)
    .map(path => [ path, paths[path] ])
    .forEach(args => this._bindPath.apply(this, args));

}

SpecioClient.prototype = {

  _bindOperation: function (path, method, spec) {

    let securitySpec = spec['security'] && spec['security'][0];
    let securitySpecKey, securityDef;
    if (securitySpec) {
      securitySpecKey = Object.keys(securitySpec)[0];
      if (securitySpecKey) {
        securityDef = this._resolveSecurityDefinition(securitySpecKey);
      }
    }

    this._api[spec.operationId] = (function (path, method, securityDef) {

      let mkReq = this._proxy(path, method);

      if (securityDef && securityDef.name && securityDef.type === 'apiKey') {
        if (securityDef['in'] === 'query') mkReq = mkReq.query({ [securityDef.name]: this._apiKey });
        if (securityDef['in'] === 'header') mkReq = mkReq.set(securityDef.name, this._apiKey);
      }
      // else if (securityDef && securityDef.type === 'basic') {
      //   /// TODO: support basic authorization
      // }
      // else if (securityDef && securityDef.type === 'oauth2') {
      //   /// TODO: support oauth2
      // }

      return mkReq;

    }).bind(this, path, method, securityDef);

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

  _resolveSecurityDefinition: function (name) {
    return this.spec['securityDefinitions'][name];
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
  },

  /**
   * Set api key for request.
   * @param {string} key
   */
  useApiKey: function (key) {
    this._apiKey = key;
    return this;
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
 * Create specio client from api spec.
 * @param {object} spec - API specification
 * @returns
 */
function specio(spec) {
  return new SpecioClient(spec);
}

specio.Client = SpecioClient;

/**
 * Load api specification from url and create the client.
 * @param {string} url
 * @returns {Promise}
 */
specio.load = function (url) {
  return agent
    .get(url)
    .usePromise(Promise)
    .json(spec => {
      try {
        let client = specio(spec);
        return Promise.resolve(client);
      }
      catch(err) {
        return Promise.reject(err);
      }
    });
};

module.exports = specio;
