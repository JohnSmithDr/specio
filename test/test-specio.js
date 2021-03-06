'use strict';

const expect = require('chai').expect;
const specio = require('..');

let spec = {
  paths: {
    '/foo': {
      options: {
        operationId: 'sendOptions'
      },
      head: {
        operationId: 'sendHead'
      },
      get: {
        operationId: 'getFoo'
      },
      post: {
        operationId: 'postFoo'
      },
      put: {
        operationId: 'putFoo'
      },
      patch: {
        operationId: 'patchFoo'
      },
      delete: {
        operationId: 'deleteFoo'
      }
    }
  }
};

describe('specio', function () {

  describe('#constructor()', function () {

    it('should be ok', function () {
      let client = specio({});
      expect(client).to.be.instanceOf(specio.Client);
      expect(client._scheme).to.equal('http');
      expect(client._host).to.equal('localhost');
      expect(client._basePath).to.equal('/');
      expect(client._promiseConstructor).to.equal(Promise);
      expect(client._api).to.deep.equal({});
    });

  });

  describe('#usePromise()', function () {

    it('should be ok', function () {
      let client = specio({});
      client.usePromise(Promise);
      expect(client._promiseConstructor).to.equal(Promise);
    });

    it('should fail for invalid promise constructor', function () {
      let client = specio({});
      expect(() => client.usePromise(String)).to.throw(Error, /expected a promise constructor/);
    });

  });

  describe('#useApp()', function () {

    it('should be ok', function () {
      let client = specio({});
      return client.useApp((req, res) => {}, 3000)
        .then(c => {
          expect(c).to.equal(client);
          expect(c._host).to.equal('localhost:3000');
        });
    });

    it('should failed for invalid handler', function () {
      let client = specio({});
      return client.useApp('foo', 3000)
        .catch(err => {
          expect(err).to.be.an('error');
        });
    });

  });

  describe('#useApiKey()', function () {

    it('should be ok', function () {
      let client = specio({}).useApiKey('special-key');
      expect(client._apiKey).to.equal('special-key');
    });

  });

  describe('#spec', function () {

    it('should be ok', function () {
      let client = specio(spec);
      expect(client.spec).to.equal(spec);
    });

  });

  describe('#api', function () {

    it('should be ok', function () {
      let client = specio(spec);
      expect(client.api.sendOptions).to.be.a('function');
      expect(client.api.sendHead).to.be.a('function');
      expect(client.api.getFoo).to.be.a('function');
      expect(client.api.postFoo).to.be.a('function');
      expect(client.api.putFoo).to.be.a('function');
      expect(client.api.patchFoo).to.be.a('function');
      expect(client.api.deleteFoo).to.be.a('function');
    });

  });

  describe('.load()', function () {

    it('should load swagger doc from url', function () {

      this.timeout(30 * 1000);
      return specio
        .load('http://petstore.swagger.io/v2/swagger.json')
        .then(client => {
          expect(client).to.be.instanceOf(specio.Client);

          client.useApiKey('special-key');
          let req;
          req = client.api.getPetById();
          expect(req.header['api_key']).to.equal('special-key');

          req = client.api.getInventory();
          expect(req.header['api_key']).to.equal('special-key');
        });

    });

    it('should fail for invalid url', function () {
      this.timeout(30 * 1000);
      return specio
        .load('http://example.org/foo')
        .then(c => Promise.reject('should not be here'))
        .catch(err => {
          expect(err).to.be.an('error');
          expect(err.message).to.equal('Not Found');
        })
    });

  });

});
