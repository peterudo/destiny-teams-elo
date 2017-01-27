'use strict';

const Hapi = require('hapi');
const elo = require('./elo');

const server = new Hapi.Server();
server.connection({port: process.env.PORT || 3000});

server.route({
    method: 'POST',
    path: '/seed',
    handler: function (request, reply) {
        const payload = request.payload;

        const modes = [
            'skirmish',
            'salvage',
            'rumble',
            'too'
        ];

        elo
            .processTeams(payload.teams, payload.modes || modes)
            .then(reply);
    }
});

server.start((err) => {
    if (err) {
        throw err;
    }

    console.log('Server running at:', server.info.uri);
});
