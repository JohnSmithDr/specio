# specio

[![Build Status](https://travis-ci.org/JohnSmithDr/specio.svg?branch=master)](https://travis-ci.org/JohnSmithDr/specio)
[![Coverage Status](https://coveralls.io/repos/github/JohnSmithDr/specio/badge.svg?branch=master)](https://coveralls.io/github/JohnSmithDr/specio?branch=master)

Build rest api client with specification. It uses swagger 2.0 compatible specification to build the api. It can be use
as a third party api client builder, and also for test the rest api of your own.


## Usage

```js

const specio = require('specio');

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

let client = specio(spec);

// can use a specific promise
// client.usePromise(require('bluebird'));

// all the operations are wrapped in client.api

client.api.index().then(res => handle(res));
// -> GET /api/index

client.api.queryResources().query({ foo: 'bar' });
// -> GET /api/resources?foo=bar

client.api.createResource().send({ foo: 'bar' });
// -> POST /api/resources -d '{"foo":"bar"}'

client.api.getResource().params({ id: 'foo' });
// -> GET /api/resources/foo

client.api.putResource().params({ id: 'foo' }).send({ foo: 'Bar' });
// -> PUT /api/resources/foo -d '{"foo":"Bar"}'

client.api.patchResource().params({ id: 'foo' }).send({ foo: 'Bar' });
// -> PATCH /api/resources/foo -d '{"foo":"Bar"}'

client.api.deleteResource().params({ id: 'foo' });
// -> DELETE /api/resources/foo

```


## Todo

1.  api security:
    +  api key
    +  oauth2
2.  params validation \[optional\]
3.  and more ...


## License

MIT
