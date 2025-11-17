/* eslint-disable */
const webpack = require('webpack');
module.exports = function override(config, env) {
    config.resolve.fallback = {
        url: require.resolve('url/'),
        fs: require.resolve('fs'),
        assert: require.resolve('assert'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        os: require.resolve('os-browserify/browser'),
        buffer: require.resolve('buffer/'),
        stream: require.resolve('stream-browserify'),
        process: require.resolve('process/browser.js')
    };
    // Some packages import 'process/browser' directly (ESM), add an explicit alias
    // so requests like 'process/browser' resolve to the JS file with extension.
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['process/browser'] = require.resolve('process/browser.js');
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser',
            Buffer: ['buffer', 'Buffer'],
        }),
    );

    return config;
}
