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
      method: 'POST',
      path: '/api/{method}',
      handler: function(request, h) {
        const authorized = service.auth(request.payload.token);
        if (authorized === false) {
          return h.code(401);
        }

        const method = encodeURIComponent(request.params.method);
        console.log('POST:' + method);

        let data = null;
        let code = 200;
        switch (method) {
          case 'fetchAllContact':
            data = service.fetchAllContact();
            break;
          case 'fetchRecentChatContact':
            data = service.fetchRecentChatContact();
            break;
          case 'fetchNotifications':
            data = service.fetchNotifications();
            break;
          case 'fetchMyContact':
            data = service.fetchMyContact(request.query);
            break;
          case 'createNewUser':
            try {
              service.createNewUser(request.payload);
            } catch (error) {
              console.error(error);
              code = 500;
            }
            break;
        }

        return h.response(data).code(code);
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
