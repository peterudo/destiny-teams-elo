# Destiny team Elo

# Description
This is just a simple script to calculate the average Elo of a team of players across many game modes.

It's used as a way of seeding teams in a Norwegian tournament.

Feel free to use it however you'd like, but it's not very user friendly.

# Installation

 * Clone the repository and run `npm install`.

 * Run the script using `node main.js`.

If you want to use your own list of teams, edit `teams_example.csv`.

If you want to fetch teams another way, just rewrite the `getTeams()` function in `main.js` and make sure you return an array with the same structure.

If you want to completely rewrite everything, go ahead!
