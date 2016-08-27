'use strict';

const SpecioClient = require('./specio-client');

/**
 * @param {object} spec - API specification
 * @returns
 */
function specio(spec) {
  return new SpecioClient(spec);
}

specio.Client = SpecioClient;

module.exports = specio;