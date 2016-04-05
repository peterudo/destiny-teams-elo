const request = require('request-prom');
const Promise = require('bluebird');
const R = require('ramda');
const fs = require('fs');

module.exports.process = processTeams;
module.exports.getTeamsFromCsv = getTeamsFromCsv;
module.exports.getTeamsFromCsvFile = getTeamsFromCsvFile;

const MODES = {
    skirmish: 9,
    control: 10,
    salvage: 11,
    clash: 12,
    rumble: 13,
    too: 14,
    doubles: 15,
    ironbanner: 19,
    elimination: 23,
    rift: 24,
    zonecontrol: 28,
    srl: 29,
    crimsondoubles: 523
};

const curried = {
    getAndAddPlayerToTeam: R.curry(getAndAddPlayerToTeam),
    addPlayerToTeam: R.curry(addPlayerToTeam),
    getCompleteTeamData: R.curry(getCompleteTeamData)
}

function processTeams(teams, modes) {
    return Promise.map(teams, curried.getCompleteTeamData(modes));
}

function getCompleteTeamData(modes, team) {
    var teamData = {
        name: team.name,
        players: team.players,
        elo: [],
        gamesPlayed: []
    };

    return Promise.reduce(team.players, curried.getAndAddPlayerToTeam(modes), teamData).then(calculateFinalTeamData)
}

function getAndAddPlayerToTeam(modes, teamData, playerName) {
    return getPlayerId(playerName)
        .then(curried.addPlayerToTeam(modes, teamData))
        .catch((error) => {
            console.error('Error', error);
        });
}

function addPlayerToTeam(modes, teamData, playerId) {
    return Promise.reduce(modes, (teamData, modeKey) => {
        return addPlayerToTeamForMode(teamData, playerId, MODES[modeKey]);
    }, teamData);
}

function addPlayerToTeamForMode(teamData, playerId, mode) {
    return getPlayerModeDataForPlayer(playerId, mode)
        .then((playerData) => {
            // No player data, the player has never played the mode
            if (playerData) {
                teamData.gamesPlayed.push(playerData.gamesPlayed || 0);
                teamData.elo.push(playerData.elo);
            }

            return teamData;
        });
}

function calculateFinalTeamData(finalTeamData) {
    var sum = (total, value) => total + value;

    finalTeamData.totalGamesPlayed = finalTeamData.gamesPlayed.reduce(sum);
    finalTeamData.totalElo = finalTeamData.elo.reduce(sum);

    finalTeamData.avgGamesPlayed = Math.round(finalTeamData.totalGamesPlayed / finalTeamData.gamesPlayed.length);
    finalTeamData.avgElo = Math.round(finalTeamData.totalElo / finalTeamData.elo.length);

    console.log('Team', finalTeamData.name);
    console.log('Players', finalTeamData.players);
    console.log('Avg elo', finalTeamData.avgElo);
    console.log('Avggames played', finalTeamData.avgGamesPlayed);
    console.log('-------------');

    return finalTeamData;
}

function getPlayerId(name) {
    var options = {
        url: 'http://proxy.guardian.gg/Platform/Destiny/SearchDestinyPlayer/2/' + name,
        method: 'GET',
        json: true
    };

    return request(options).then((response) => {
        if (!response.body.Response.length) {
            throw new Error('Failed to find player ' + name);
        }

        return response.body.Response[0].membershipId;
    });
}

function getPlayerModeDataForPlayer(playerId, mode) {
    var options = {
        url: 'http://api.guardian.gg/elo/' + playerId,
        method: 'GET',
        json: true
    };

    return request(options).then((response) => {
        return response.body.find((elo) => elo.mode === mode);
    });
}

function getTeamsFromCsv(csv) {
    var lines = csv.split(/\"\n/);

    var keys = [false, 'name', 'contact', 'player1', 'player2', 'player3', 'subs', 'twitch'];

    var data = [];

    lines.forEach((line, i) => {
        if (i === 0) {
            return;
        }

        i = i - 1;

        line = line.substr(1, line.length);
        var values = line.split('","');

        data[i] = {};
        keys.forEach((key, j) => {
            if (key) {
                data[i][key] = values[j].replace('"', '');
            }
        });

        data[i].players = [
            data[i].player1,
            data[i].player2,
            data[i].player3
        ];

        delete data[i].player1;
        delete data[i].player2;
        delete data[i].player3;
    });

    return data;
}

function getTeamsFromCsvFile(file) {
    return getTeamsFromCsv(fs.readFileSync(file).toString());
}
