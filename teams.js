var request = require('request-prom');
var Promise = require('bluebird');
var R = require('ramda');

module.exports.process = processTeams;

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
    return getPlayerId(playerName).then(curried.addPlayerToTeam(modes, teamData));
}

function addPlayerToTeam(modes, teamData, playerId) {
    return Promise.reduce(modes, (teamData, modeKey) => {
        return addPlayerToTeamForMode(teamData, playerId, MODES[modeKey]);
    }, teamData);
}

function addPlayerToTeamForMode(teamData, playerId, mode) {
    return getPlayerModeDataForPlayer(playerId, mode)
        .then((playerData) => {
            teamData.gamesPlayed.push(playerData.gamesPlayed);
            teamData.elo.push(playerData.elo);

            return teamData;
        });
}

function calculateFinalTeamData(finalTeamData) {
    var sum = (total, value) => total + value;

    finalTeamData.totalGamesPlayed = finalTeamData.gamesPlayed.reduce(sum);
    finalTeamData.totalElo = finalTeamData.elo.reduce(sum);

    finalTeamData.avgGamesPlayed = Math.round(finalTeamData.totalGamesPlayed / finalTeamData.gamesPlayed.length);
    finalTeamData.avgElo = Math.round(finalTeamData.totalElo / finalTeamData.elo.length);

    // console.log('Team', finalTeamData);
    // console.log('Players', finalTeamData.players);
    // console.log('Avg elo', finalTeamData.avgElo);
    // console.log('Avggames played', teamData.avgGamesPlayed);
    // console.log('-------------');

    return finalTeamData;
}

function getPlayerId(name) {
    var options = {
        url: 'http://proxy.guardian.gg/Platform/Destiny/SearchDestinyPlayer/2/' + name,
        method: 'GET',
        json: true
    };

    return request(options).then((response) => response.body.Response[0].membershipId);
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
