const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const WebpackShellPlugin = require('webpack-shell-plugin');

module.exports = {
    entry: {
        list: ['./app/index.js'],
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                },
            },
            {
                test: /\.(css|scss)$/,
                use: [
                    'style-loader', // creates style nodes from JS strings
                    'css-loader', // translates CSS into CommonJS
                    'sass-loader', // compiles Sass to CSS, using Node Sass by default
                ],
            },
            {
                test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            name: '[name].[ext]',
                            outputPath: 'fonts/',
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        // This will reduce the size of the bundle by removing the unused languages in moment.js
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /us/),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production'),
            },
        }),
        new CopyWebpackPlugin([
            {
                from: 'favicon.ico',
            },
            {
                from: 'static',
                to: 'static',
            },
        ]),
        new WebpackShellPlugin({
            onBuildStart: ['node ./data/translationsGenerator']
        }),
        new HtmlWebpackPlugin({
            title: 'EBU LIST',
            template: './index.html',
            inject: 'body',
        }),
    ],
    resolve: {
        modules: [path.resolve('./app'), path.resolve('./'), 'node_modules'],
        alias: {
            ebu_list_common: path.resolve(__dirname, '../../js/common'),
        },
    },
};
