'use strict';

const hapi = require('hapi');
const vision = require('vision');
const pug = require('pug');
const hrb = require('hapi-route-builder');
const elasticsearch = require('elasticsearch');
const inert = require('inert');
const path = require('path');

const routeBuilder = hrb.RouteBuilder;

// Create a server with a host and port
const server = hapi.server({
  host: '0.0.0.0',
  port: 3000,
  routes: {
    files: {
      relativeTo: path.join(__dirname, 'node_modules')
    }
  }
});

// Add the route
server.route({
  method: 'GET',
  path: '/',
  handler: function (request, reply) {
    return reply.view('index');
  }
});

routeBuilder.setRootPath("/cat");

server.route(new routeBuilder().
  get().
  path("/indices").
  handler(async (request, reply) => {
    const es = getESClient(request.query.endpoint);
    const indices = await es.cat.indices({
      format: "json",
      v: true
    });
    return reply.view('indices', {
      indices: indices
    });
  }).build()
);

routeBuilder.setRootPath("/indices");

server.route(new routeBuilder().
  get().
  path("/mappings").
  handler(async (request, reply) => {
    const es = getESClient(request.query.endpoint);
    const mappings = await es.indices.getMapping({
      index: request.query.indx
    });
    return reply.view('mappings', {
      mappings: mappings,
      indx_name: request.query.indx
    });
  }).build()
);


routeBuilder.setRootPath();

// Start the server
async function start() {

  try {
    await server.register(vision);
    await server.register(inert);

    server.route({
      method: 'GET',
      path: '/node_modules/{param*}',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: false,
          listing: true
        }
      }
    });


    server.views({
      engines: { pug: pug },
      relativeTo: __dirname,
      path: 'templates'
    });

    await server.start();
  }
  catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();

function getESClient(endpoint) {
  const client = new elasticsearch.Client({
    host: endpoint
  });
  return client;
}
