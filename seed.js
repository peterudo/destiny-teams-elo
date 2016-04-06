var elo = require('./elo');

// List of modes you want an average of
var modes = [
    'skirmish',
    'salvage',
    'rumble',
    'too'
];

elo.processTeams(getTeams(), modes).then(printTeams);

function printTeams(teams) {
    teams = teams.sort((a, b) => b.avgElo - a.avgElo);

    teams.forEach((team, i) => {
        console.log(`${i + 1}. ${team.name} (${team.avgElo} elo) - ${team.players.join(', ')}`);
    });
}

function getTeams() {
    return require('./teams.json');
}
