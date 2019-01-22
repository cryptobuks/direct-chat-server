'use strict';
require('dotenv').config();

const Hapi = require('hapi');
const service = require('./service');
const Inert = require('inert');
const test = require('./test');

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
      handler: async function(request, h) {
        let data = {};
        let code = 200;
        try {
          const email = service.auth(request.payload.token);
          if (!email) {
            return h.response().code(401);
          }

          const method = encodeURIComponent(request.params.method);
          console.log('POST:' + method);

          switch (method) {
            case 'fetchAllContact':
              data = await service.fetchAllContact();
              break;
            case 'fetchRecentChatContact':
              data = await service.fetchRecentChatContact();
              break;
            case 'fetchNotifications':
              data = await service.fetchNotifications();
              break;
            case 'fetchMyContact':
              data = await service.fetchMyContact(email);
              break;
            case 'createNewUser':
              try {
                [data, code,] = await service.createNewUser(request.payload);
              } catch (error) {
                console.error(error);
                code = 500;
              }
              break;
            default:
              code = 400;
          }
        } catch (error) {
          console.log(error);
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
