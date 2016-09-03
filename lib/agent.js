'use strict';

const superagent = require('superagent');
const utils = require('./utils');

let Request = superagent.Request;

/**
 * Overwrite request url with base path.
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
 * Overwrite host part in request url. Should be call after setting base path.
 * @param {string} host
 * @returns {superagent.Request}
 */
Request.prototype.host = function (host) {
  if (this.url.startsWith('/')) {
    this.url = host + this.url;
  }
  return this;
};

/**
 * Overwrite scheme part of request url.
 * @param {string} scheme
 */
Request.prototype.scheme = function (scheme) {
  if (/^[\w_-]+:\/\//.test(this.url)) {
    this.url = this.url.replace(/^([\w_-]+)(:\/\/.*)/, `${scheme}$2`);
  }
  else {
    this.url = `${scheme}://${this.url}`;
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

/**
 * Send request and get result as text.
 * @param {function} callback
 * @returns {Promise}
 */
Request.prototype.text = function (callback) {
  return this.then(res => callback(res.text));
};

/**
 * Send request and get result as json object.
 * @param callback
 * @returns {Promise}
 */
Request.prototype.json = function (callback) {
  return this.then(res => callback(res.body));
};

module.exports = superagent;
