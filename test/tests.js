'use strict';

const expect = require('chai').expect;
const express = require('express');
const specio = require('..');

let spec = {
  schemas: ['http'],
  host: 'localhost',
  basePath: '/api',
  paths: {
    '/': {
      get: {
        operationId: 'index'
      }
    },
    '/resources': {
      get: {
        operationId: 'queryResources'
      },
      post: {
        operationId: 'createResource'
      }
    },
    '/resources/{id}': {
      get: {
        operationId: 'getResource'
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

describe('specio with server', function () {

  let app, client;

  before(function () {

    app = express();

    let defaultRouter = express.Router();
    defaultRouter.get('/', (req, res) => {
      res.send('GET index');
    });

    let resourcesRouter = express.Router();
    resourcesRouter
      .get('/', (req, res) => {
        res.send('Query Resources');
      })
      .post('/', (req, res) => {
        res.send('Create Resource');
      });
    resourcesRouter.get('/:id', (req, res) => {
      res.send(`Get Resource: ${req.params.id}`);
    });
    resourcesRouter.put('/:id', (req, res) => {
      res.send(`Put Resource: ${req.params.id}`);
    });
    resourcesRouter.patch('/:id', (req, res) => {
      res.send(`Patch Resource: ${req.params.id}`);
    });
    resourcesRouter.delete('/:id', (req, res) => {
      res.send(`Delete Resource: ${req.params.id}`);
    });

    app.use('/api', defaultRouter);
    app.use('/api/resources', resourcesRouter);

    client = specio(spec);
    return client.useApp(app, 6969);
  });

  it('should get index', function () {
    return client.api.index()
      .then(res => {
        expect(res.text).to.equal('GET index');
      });
  });

  it('should query resources', function () {
    return client.api.queryResources()
      .then(res => {
        expect(res.text).to.equal('Query Resources');
      });
  });

  it('should create resource', function () {
    return client.api.createResource()
      .then(res => {
        expect(res.text).to.equal('Create Resource');
      });
  });

  it('should get resource', function () {
    return client.api.getResource()
      .params({ id: 'foo' })
      .then(res => {
        expect(res.text).to.equal('Get Resource: foo');
      });
  });

  it('should put resource', function () {
    return client.api.putResource()
      .params({ id: 'foo' })
      .then(res => {
        expect(res.text).to.equal('Put Resource: foo');
      });
  });

  it('should patch resource', function () {
    return client.api.patchResource()
      .params({ id: 'foo' })
      .then(res => {
        expect(res.text).to.equal('Patch Resource: foo');
      });
  });

  it('should delete resource', function () {
    return client.api.deleteResource()
      .params({ id: 'foo' })
      .then(res => {
        expect(res.text).to.equal('Delete Resource: foo');
      });
  });

});
