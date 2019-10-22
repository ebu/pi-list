const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = merge(common, {
    mode: 'development',
    devtool: 'inline-source-map',
    // devtool: 'eval-source-map',
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('development'),
            },
        }),
        new WebpackShellPlugin({
            onBuildStart: ['node ./data/translationsGenerator']
        }),
    ],
    devServer: {
        hot: true,
        port: 8080,
        host: '0.0.0.0',
        historyApiFallback: true,
    },
});
