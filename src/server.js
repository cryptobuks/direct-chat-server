'use strict';

const Hapi = require('hapi');
const service = require('./service');
const Inert = require('inert');

// Create a server with a host and port
const server = Hapi.server({
  host: 'localhost',
  port: 8000,
  routes: {
    cors: true,
    files: {
      relativeTo: __dirname,
    },
  },
});

const validate = async function(decoded, request) {
  return { isValid: true, };
};

// Start the server
const start = async function() {
  try {
    await server.register(Inert);

    server.route({
      method: 'POST',
      path: '/api/{method}',
      handler: function(request, h) {
        const method = encodeURIComponent(request.params.method);
        console.log('POST:' + method);
        if (method === 'createNewUser') {
          return service.createNewUser(request.payload);
        }
        return `Unkown method:${method}`;
      },
    });

    server.route({
      method: 'GET',
      path: '/assets/{file*}',
      handler: {
        directory: {
          path: './assets',
          listing: false,
        },
      },
    });

    server.route({
      method: 'GET',
      path: '/api/{method}',
      handler: function(request, h) {
        const method = encodeURIComponent(request.params.method);
        console.log('GET:' + method);
        if (method === 'fetchAllContact') {
          return service.fetchAllContact();
        }
        if (method == 'fetchRecentChatContact') {
          return service.fetchRecentChatContact();
        }
        if (method == 'fetchNotifications') {
          return service.fetchNotifications();
        }
        if (method == 'fetchMyContact') {
          return service.fetchMyContact(request.query);
        }
        return `Unkown method:${method}`;
      },
    });

    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
