var teams = require('./teams');
var fs = require('fs');

// List of modes you want an average of
var modes = [
    'skirmish',
    'salvage',
    'rumble',
    'too'
];

teams.process(getTeams(), modes).then(printTeams);

function printTeams(teams) {
    teams = teams.sort((a, b) => b.avgElo - a.avgElo);

    teams.forEach((team, i) => {
        console.log(`${i + 1}. ${team.name} (${team.avgElo}, ${team.totalGamesPlayed}) - ${team.players.join(', ')}`);
    });
}

/**
 * Must return an array with the follow structure
 *
 * [{
 *     "name": "Team Awesome",
 *     "players": [
 *         "Luminosity48",
 *         "RealKraftyy",
 *         "Ramblinnn"
 *     ]
 * }]
 *
 * @return {Array}
 */
function getTeams() {
    // Replace this with your own way of fetching teams if you want
    return getTeamsFromCsvFile('./teams_example.csv');
}

function getTeamsFromCsvFile(file) {
    var keys = [false, 'name', 'contact', 'player1', 'player2', 'player3'];

    var lines = fs.readFileSync(file).toString().split(/\"\n/);
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
