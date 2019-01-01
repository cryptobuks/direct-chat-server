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

// Add the route
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
      return service.fetchMyContact();
    }
    return `Unkown method:${method}`;
  },
});

// Start the server
const start = async function() {
  try {
    await server.register(Inert);
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
    await server.start();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  console.log('Server running at:', server.info.uri);
};

start();
