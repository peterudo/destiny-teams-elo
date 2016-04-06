'use strict';

const Hapi = require('hapi');
const elo = require('./elo');

const server = new Hapi.Server();
server.connection({port: process.env.PORT || 3000});

server.register(require('inert'), (err) => {
    if (err) {
        throw err;
    }

    server.route({
        method: 'GET',
        path: '/{param*}',
        handler: {
            directory: {
                path: 'web'
            }
        }
    });
});

server.route({
    method: 'GET',
    path: '/teams.json',
    handler: function (request, reply) {
        const teams = require('./teams.json');

        if (!request.query.seed) {
            return reply(teams);
        }

        const modes = [
            'skirmish',
            'salvage',
            'rumble',
            'too'
        ];

        elo.processTeams(teams, modes).then(reply);
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
