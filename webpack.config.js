/* eslint-env node */
const webpack = require('webpack');

module.exports = {
    context: __dirname + '/web',
    entry: './scripts/main.jsx',
    output: {
        filename: './web/main.js'
    },
    module: {
        loaders: [
            {
                test: /\.html$/,
                loader: 'raw'
            },
            {
                test: /\.jsx?$/,
                loader: 'babel',
                query: {
                    presets: ['es2015', 'react']
                }
            }
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            'fetch': 'imports?this=>global!exports?global.fetch!whatwg-fetch'
        }),
        new webpack.optimize.DedupePlugin(),
        // new webpack.DefinePlugin({
        //     'process.env': {
        //         NODE_ENV: JSON.stringify('production')
        //     }
        // })
    ]
};
