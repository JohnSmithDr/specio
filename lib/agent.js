'use strict';

const superagent = require('superagent');
const utils = require('./utils');

let Request = superagent.Request;

/**
 * Override request url with base path.
 * @param {string} path
 * @returns {superagent.Request}
 */
Request.prototype.basePath = function (path) {
  if (this.url.startsWith('/')) {
    this.url = path + this.url;
  }
  return this;
};

/**
 * Set parameters in path.
 * @param {object} params - parameters in path.
 * @returns {superagent.Request}
 */
Request.prototype.params = function (params) {
  this.url = Object
    .keys(params)
    .reduce((x, key) => {
      let pattern = new RegExp(`{${key.toString()}}`, 'g');
      return x.replace(pattern, String(params[key]));
    }, this.url);
  return this;
};

/**
 * Set specific promise constructor for current request.
 * @param {Promise} promiseConstructor
 * @returns {superagent.Request}
 */
Request.prototype.usePromise = function (promiseConstructor) {

  if (!utils.isPromiseConstructor(promiseConstructor)) {
    throw Error('expected a promise constructor');
  }

  this._promiseCtor = promiseConstructor;
  return this;
};

/**
 * Send request and get result in promise.
 * @param {function} callback
 * @returns {Promise}
 */
Request.prototype.then = function (callback) {
  let ctor = this._promiseCtor || Promise;
  let prmx = new ctor((resolve, reject) => {
    this.end((err, res) => err ? reject(err) : resolve(res));
  });
  return prmx.then(res => callback(res));
};

/**
 * Send request and try to catch error.
 * @param {function} callback
 * @returns {Promise}
 */
Request.prototype.catch = function (callback) {
  let ctor = this._promiseCtor || Promise;
  let prmx = new ctor((resolve, reject) => {
    this.end((err, res) => err ? reject(err) : resolve(res));
  });
  return prmx.catch(err => callback(err));
};

module.exports = superagent;
