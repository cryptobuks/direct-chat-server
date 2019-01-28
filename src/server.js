'use strict';
require('dotenv').config();

const Hapi = require('hapi');
const service = require('./service');
const Inert = require('inert');
const db = require('./db/db');
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
          const payload = request.payload;
          if (!service.auth(payload.email, payload.token)) {
            return h.response().code(401);
          }

          const method = encodeURIComponent(request.params.method);
          console.log('POST:' + method);

          switch (method) {
            case 'fetchAllContact':
              data = await service.fetchAllContact(payload.email);
              break;
            case 'fetchRecentChatContact':
              data = await service.fetchRecentChatContact(payload.email);
              break;
            case 'fetchNotifications':
              data = await service.fetchNotifications(payload.email);
              break;
            case 'fetchMyContact':
              data = await service.fetchMyContact(payload.email);
              break;
            case 'createNewUser':
              try {
                [data, code,] = await service.createNewUser(payload);
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
          code = 500;
        }

        return h.response(data).code(code);
      },
    });

    server.route({
      method: 'POST',
      path: '/api/fb/{method}',
      handler: async function(request, h) {
        let data = {};
        let code = 200;
        try {
          const method = encodeURIComponent(request.params.method);
          console.log('POST:' + method);

          switch (method) {
            case 'createUser':
              [data, code,] = await service.creatUserWithFbToken(
                request.payload
              );
              break;
            default:
              code = 400;
          }
        } catch (error) {
          console.log(error);
          code = 500;
        }

        console.log(`data:${JSON.stringify(data)}`);
        return h.response(data).code(code);
      },
    });

    server.route({
      method: 'POST',
      path: '/api/google/{method}',
      handler: async function(request, h) {
        let data = {};
        let code = 200;
        try {
          const method = encodeURIComponent(request.params.method);
          console.log('POST:' + method);

          switch (method) {
            case 'createUser':
              [data, code,] = await service.creatUserWithGoogleToken(
                request.payload
              );
              break;
            default:
              code = 400;
          }
        } catch (error) {
          console.log(error);
          code = 500;
        }

        console.log(`data:${JSON.stringify(data)}`);
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
