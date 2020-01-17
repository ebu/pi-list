const webpack = require('webpack');
const merge = require('webpack-merge');
const WebpackShellPlugin = require('webpack-shell-plugin');
const common = require('./webpack.common.js');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    // devtool: 'eval-source-map',
    output: {
        publicPath: '/',
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
        new WebpackShellPlugin({
            onBuildStart: ['node ./data/translationsGenerator', 'node ./data/credits/generateCredits.js'],
        }),
    ],
    devServer: {
        hot: true,
        port: 8080,
        host: '0.0.0.0',
        historyApiFallback: true,
    },
});
