# specio

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

client.api.index();
// -> GET /api/index

client.api.queryResources({}, { foo: 'bar' });
// -> GET /api/resources?foo=bar

client.api.createResource({}, { foo: 'bar' });
// -> POST /api/resources -d '{"foo":"bar"}'

client.api.getResource({ id: 'foo' });
// -> GET /api/resources/foo

client.api.putResource({ id: 'foo' }, { foo: 'Bar' });
// -> PUT /api/resources/foo -d '{"foo":"Bar"}'

client.api.patchResource({ id: 'foo' }, { foo: 'Bar' });
// -> PATCH /api/resources/foo -d '{"foo":"Bar"}'

client.api.deleteResource({ id: 'foo' });
// -> DELETE /api/resources/foo

```


## Todo

1.  to support request content types:
    +  form
    +  xml
2.  to support response content types:
    +  json
    +  xml
3.  api security:
    +  api key
    +  oauth2
4.  params validation \[optional\]
5.  and more ...


## License

MIT
