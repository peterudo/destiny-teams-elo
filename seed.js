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
    console.log('Data for', modes.join(', '), ':');
    console.log(JSON.stringify(teams, null, 4));

    teams.forEach((team, i) => {
        console.log(`${i + 1}. ${team.name} (${team.elo} elo, ${team.kd} k/d) - ${Object.keys(team.players).join(', ')}`);
    });
}

function getTeams() {
    return require('./teams.json');
}
