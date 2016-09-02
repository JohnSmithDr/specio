'use strict';

const http = require('http');

const agent = require('./agent');
const utils = require('./utils');

/**
 * @param {object} spec
 * @param {string} [spec.schemes]
 * @param {string} [spec.host]
 * @param {string} [spec.basePath]
 * @constructor
 */
function SpecioClient(spec) {

  this._spec = spec;
  this._scheme = Array.isArray(spec.schemes) ? spec.schemes[0] : 'http';
  this._host = spec.host || 'localhost:80';
  this._basePath = spec.basePath || '/';
  this._promiseConstructor = Promise;
  this._api = {};
  this._server = null;

  let _this = this;

  function _act(path, method, spec) {
    _this._api[spec.operationId] = (function (params) {
      return this[method](path, params);
    }).bind(_this);
  }

  function _actWithQuery(path, method, spec) {
    _this._api[spec.operationId] = (function (params, query) {
      return this[method](path, params, query);
    }).bind(_this);
  }

  function _actWithBody(path, method, spec) {
    _this._api[spec.operationId] = (function (params, body, query) {
      return this[method](path, params, body, query);
    }).bind(_this);
  }

  function _bindApi(path, spec) {
    let def = {
      'head': _act,
      'options': _act,
      'delete': _actWithQuery,
      'get': _actWithQuery,
      'post': _actWithBody,
      'put': _actWithBody,
      'patch': _actWithBody
    };
    Object
      .keys(def)
      .map(method => ({ method, fn: def[method] }))
      .map(x => (spec[x.method]) ? ({ method: x.method, fn: x.fn, spec: spec[x.method] }) : null)
      .filter(x => x && x.spec && x.spec.operationId)
      .forEach(x => x.fn.call(this, path, x.method, x.spec));
  }

  let paths = spec.paths;
  Object.keys(paths).map(path => [ path, paths[path] ]).forEach(args => _bindApi.apply(this, args));

}

SpecioClient.prototype = {

  /**
   * @param {string} path - api path
   * @param {object} [params]
   * @returns {string}
   * @private
   */
  resolvePath: function (path, params) {
    params = params || {};
    let r = `${this._host}${this._basePath}${path}`.replace(/\/+/g, '/');
    r = `${this._scheme}://${r}`;
    return Object
      .keys(params)
      .reduce((x, key) => {
        let pattern = new RegExp(`{${key.toString()}}`, 'g');
        return x.replace(pattern, String(params[key]));
      }, r);
  },

  /**
   * Send http request.
   * @param {string} path - api path
   * @param {string} method - standard http method
   * @param {object} [params] - params in request path
   * @param {object} [query] - things to send via query string
   * @param {object} [body] - things to send via body
   * @returns {Promise}
   */
  request: function (path, method, params, query, body) {
    return new this._promiseConstructor((resolve, reject) => {
      let methodLowerCase = method.toLowerCase();
      let requestPath = this.resolvePath(path, params);
      //console.log('request: %s', methodLowerCase.toUpperCase(), requestPath);
      let req = agent[methodLowerCase](requestPath);
      if (query) req = req.query(query);
      if (body) req = req.send(body);
      return req.end((err, res) => err ? reject(err) : resolve(res))
    });
  },

  /**
   * Send http head request.
   * @param {string} path
   * @param {object} [params]
   * @returns {Promise}
   */
  head: function (path, params) {
    return this.request(path, 'head', params);
  },

  /**
   * Send http options request.
   * @param {string} path
   * @param {object} [params]
   * @returns {Promise}
   */
  options: function (path, params) {
    return this.request(path, 'options', params);
  },

  /**
   * Send http get request.
   * @param {string} path
   * @param {object} [params]
   * @param {object} [query]
   * @returns {Promise}
   */
  get: function (path, params, query) {
    return this.request(path, 'get', params, query);
  },

  /**
   * Send http post request.
   * @param {string} path
   * @param {object} [params]
   * @param {object} [body]
   * @param {object} [query]
   * @returns {Promise}
   */
  post: function (path, params, body, query) {
    return this.request(path, 'post', params, query, body);
  },

  /**
   * Send http put request.
   * @param {string} path
   * @param {object} [params]
   * @param {object} [body]
   * @param {object} [query]
   * @returns {Promise}
   */
  put: function (path, params, body, query) {
    return this.request(path, 'put', params, query, body);
  },

  /**
   * Send http patch request.
   * @param {string} path
   * @param {object} [params]
   * @param {object} [body]
   * @param {object} [query]
   * @returns {Promise}
   */
  patch: function (path, params, body, query) {
    return this.request(path, 'patch', params, query, body);
  },

  /**
   * Send http patch request.
   * @param {string} path
   * @param {object} [params]
   * @param {object} [query]
   * @returns {Promise}
   */
  delete: function (path, params, query) {
    return this.request(path, 'delete', params, query);
  },

  /**
   * Use specific promise constructor.
   * @param {Promise} promiseConstructor
   * @returns {SpecioClient}
   */
  usePromise: function (promiseConstructor) {

    if (!utils.isPromiseConstructor(promiseConstructor)) {
      throw Error('it is not a promise constructor');
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

Object.defineProperty(SpecioClient.prototype, 'spec', {
  get: function () {
    return this._spec;
  }
});

Object.defineProperty(SpecioClient.prototype, 'api', {
  get: function () {
    return this._api;
  }
});

module.exports = SpecioClient;
