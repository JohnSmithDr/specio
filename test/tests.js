'use strict';

const expect = require('chai').expect;
const express = require('express');

const specio = require('..');

describe('specio', function () {

  let spec = {
    schemas: ['http'],
    host: 'localhost',
    basePath: '/',
    paths: {
      '/': {
        get: {
          operationId: 'index'
        }
      },
      '/resource': {
        get: {
          operationId: 'queryResources'
        },
        post: {
          operationId: 'createResource'
        }
      },
      '/resource/{id}': {
        get: {
          operationId: 'getResources'
        },
        put: {
          operationId: 'putResource'
        },
        patch: {
          operationId: 'patchResource'
        },
        delete: {
          operationId: 'deleteResource'
        }
      }
    }
  };

  describe('constructor', function () {

    it('should be ok', function () {
      let client = specio(spec);
      expect(client).to.be.instanceOf(specio.Client);
      expect(client.api.index).to.be.a('function');
      expect(client.api.queryResources).to.be.a('function');
      expect(client.api.createResource).to.be.a('function');
      expect(client.api.getResources).to.be.a('function');
      expect(client.api.putResource).to.be.a('function');
      expect(client.api.patchResource).to.be.a('function');
      expect(client.api.deleteResource).to.be.a('function');
    });

  });

  describe.only('with-server', function () {

    let app, client;

    before(function () {

      app = express();

      app.use(express.Router()
        .get('/', (req, res) => {
          res.send('GET index');
        })
      );

      client = specio(spec);
      return client.useApp(app, 6969);
    });

    it('should get index', function () {
      return client.api.index()
        .then(res => {
          expect(res.text).to.equal('GET index');
        });
    });


  });

});