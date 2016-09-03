'use strict';

const expect = require('chai').expect;
const agent = require('../lib/agent');

describe('agent', function () {

  describe('#basePath()', function () {

    it('should overwrite request url', function () {

      let req = agent.get('/foo').basePath('/api');
      expect(req.url).to.equal('/api/foo');

    });

  });

  describe('#host()', function () {

    it('should overwrite host of request url', function () {

      let req = agent.get('/foo').basePath('/api').host('localhost:8080');
      expect(req.url).to.equal('localhost:8080/api/foo');

    });

  });

  describe('#scheme()', function () {

    it('should overwrite scheme part of request url', function () {

      let req;

      req = agent.get('/foo').basePath('/api').host('localhost:8080').scheme('http');
      expect(req.url).to.equal('http://localhost:8080/api/foo');

      req = agent.get('/foo').basePath('/api').host('http://localhost:8080').scheme('https');
      expect(req.url).to.equal('https://localhost:8080/api/foo');

    });

  });

  describe('#params()', function () {

    it('should overwrite request url with parameters', function () {

      let req;

      req = agent.get('/foo/{id}').basePath('/api').params({ id: 'bar' });
      expect(req.url).to.equal('/api/foo/bar');

      req = agent.get('/foo/{foo-id}/bar/{bar-id}')
        .basePath('/api')
        .params({ 'foo-id': 1, 'bar-id': 2 });

      expect(req.url).to.equal('/api/foo/1/bar/2');

    });

  });

  describe('#usePromise()', function () {

    it('should set promise constructor', function () {

      let req = agent.get('/foo').usePromise(Promise);
      expect(req._promiseCtor).to.equal(Promise);

    });

    it('should fail for non promise constructor', function () {

      expect(() => agent.get('/foo').usePromise(String)).to.throw(Error, /expected a promise constructor/);

    });

  });

  describe('#then()', function () {

    it('should send request and get response in promise', function () {

      return agent
        .get('http://example.org')
        .then(res => {
          expect(res.status).to.equal(200);
        });

    });

    it('should not invoke callback if request failure', function () {

      return agent
        .get('http://example.org/foo')
        .then(() => {
          return Promise.reject(Error('Should not be here'));
        })
        .catch(err => {
          expect(err.message).to.equal('Not Found');
          expect(err.response.status).to.equal(404);
        });

    });

  });

  describe('#catch()', function () {

    it('should send request and catch error', function () {

      return agent
        .get('http://example.org/foo')
        .catch(err => {
          expect(err.message).to.equal('Not Found');
          expect(err.response.status).to.equal(404);
        });

    });

    it('should not invoke callback if request success', function () {

      return agent
        .get('http://example.org')
        .catch(() => {
          return Promise.reject(Error('Should not be here'));
        })
        .then(res => {
          expect(res.status).to.equal(200);
        });

    });

  });

});


