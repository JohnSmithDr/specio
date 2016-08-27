'use strict';

const isPromiseConstructor = function (constructor) {
  return [
    constructor,
    constructor.resolve,
    constructor.reject,
    constructor.prototype.then,
    constructor.prototype.catch
  ].every(s => typeof s === 'function');
};

module.exports = {
  isPromiseConstructor
};