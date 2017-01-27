const request = require('request-prom');
const Promise = require('bluebird');
const fs = require('fs');
const config = require('./config.json');

module.exports.processTeams = processTeams;

const bungieModeNames = {
    skirmish: 'threeVsThree',
    control: 'control',
    salvage: 'lockdown',
    clash: 'team',
    rumble: 'freeForAll',
    too: 'trialsOfOsiris',
    doubles: 'doubles',
    ironBanner: 'ironBanner',
    elimination: 'elimination',
    rift: 'rift',
    zoneControl: 'zoneControl'
}

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
    zonecontrol: 28
};

const playerIds = {};

function processTeams(teams, modes) {
    return Promise
        .map(teams, (team) => getCompleteTeamData(modes, team))
        .then((teams) => {
            return teams.sort((a, b) => b.elo - a.elo);
        });
}

function getCompleteTeamData(modes, team) {
    const players = {};

    team.players.forEach((player) => {
        players[player] = {
            kd: [],
            elo: [],
            gamesPlayed: []
        };
    });

    const teamData = {
        name: team.name,
        players,
        kd: [],
        elo: []
    };

    return Promise
        .map(team.players, (player) => getAndAddPlayerToTeam(modes, teamData, player))
        .then(() => teamData)
        .then(calculateFinalTeamData);
}

function getAndAddPlayerToTeam(modes, teamData, playerName) {
    return getPlayerId(playerName)
        .then((playerId) => {
            playerIds[playerId] = playerName;

            return addPlayerToTeam(modes, teamData, playerId)
        })
        .catch((error) => {
            console.error('Error', error);
        });
}

function addPlayerToTeam(modes, teamData, playerId) {
    const elo = Promise
        .map(modes, (modeKey) => {
            return addPlayerEloToTeam(teamData, playerId, MODES[modeKey]);
        });

    const kd = getCharacters(playerId)
        .then((characterIds) => {
            return Promise.map(characterIds, (characterId) => {
                return getCharacterKd(playerId, characterId, modes);
            });
        })
        .then((characterKds) => {
            characterKds = characterKds[0];

            Object.keys(characterKds).forEach((gameMode) => {
                if (!characterKds[gameMode].allTime) {
                    return;
                }

                const allTimeKd = characterKds[gameMode].allTime.killsDeathsRatio.basic.value

                teamData.players[playerIds[playerId]].kd.push(allTimeKd);
                teamData.kd.push(allTimeKd);
            });

        });

    return Promise.all([elo, kd]);
}

function addPlayerEloToTeam(teamData, playerId, mode) {
    return getPlayerModeDataForPlayer(playerId, mode)
        .then((playerData) => {
            // No player data, the player has never played the mode
            if (playerData) {
                const player = teamData.players[playerIds[playerId]];

                teamData.elo.push(playerData.elo);
                player.elo.push(playerData.elo);
                player.gamesPlayed.push(playerData.gamesPlayed || 0);
            }

            return teamData;
        });
}

function calculateFinalTeamData(teamData) {
    var sum = (total, value) => total + value;

    const totalElo = teamData.elo.reduce(sum);
    const totalKd = teamData.kd.reduce(sum);

    teamData.elo = Math.round(totalElo / teamData.elo.length);
    teamData.kd = Math.round((totalKd / teamData.kd.length) * 100) / 100;

    Object.keys(teamData.players).forEach((playerName) => {
        const player = teamData.players[playerName];

        if (player.kd.length) {
            player.kd = Math.round((player.kd.reduce(sum) / player.kd.length) * 100) / 100;
        }

        if (player.elo.length) {
            player.elo = Math.round(player.elo.reduce(sum) / player.elo.length);
        }

        player.gamesPlayed = player.gamesPlayed.reduce(sum);
    });

/*
    console.log('Team', finalTeamData.name);
    console.log('Players', finalTeamData.players);
    console.log('Avg elo', finalTeamData.avgElo);
    console.log('Avg KD', finalTeamData.avgKd);
    console.log('Avggames played', finalTeamData.avgGamesPlayed);
    console.log('-------------');*/

    return teamData;
}

function getPlayerId(name) {
    const url = 'https://www.bungie.net/Platform/Destiny/SearchDestinyPlayer/2/' + name;

    return bungieRequest(url)
        .then((response) => {
            if (!response.length) {
                throw new Error('Failed to find player ' + name);
            }

            return response[0].membershipId;
        });
}

function getCharacters(playerId) {
    const url = 'https://www.bungie.net/Platform/Destiny/2/Account/' + playerId + '/?lc=en';

    return bungieRequest(url)
        .then((response) => {
            return response.data.characters.map((char) => char.characterBase.characterId);
        })
}

function getCharacterKd(playerId, characterId, modes) {
    modes = modes
        .map((modeKey) => MODES[modeKey])
        .join(',');

    const url = `https://www.bungie.net/Platform/Destiny/Stats/2/${playerId}/${characterId}/?modes=${modes}&lc=en`;

    return bungieRequest(url);
}

function getPlayerModeDataForPlayer(playerId, mode) {
    var options = {
        url: 'http://api.guardian.gg/elo/' + playerId,
        method: 'GET',
        json: true
    };

    return request(options)
        .then((response) => {
            return response.body.find((elo) => elo.mode === mode);
        });
}

function bungieRequest(url) {
    var options = {
        url,
        method: 'GET',
        headers: {
            'X-API-KEY': config.bungieApiKey
        },
        json: true
    };

    return request(options)
        .then((response) => response.body.Response);
}
