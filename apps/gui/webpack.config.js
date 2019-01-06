const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = {
    devtool: 'inline-source-map',
    entry: {
        list: ['babel-polyfill', './app/index.js'],
        vendor: [
            'axios',
            'react',
            'react-dom',
            'react-router',
            'react-router-dom',
            'history'
        ]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].dev.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: ['babel-loader']
            },
            {
                test: /\.s?css$/,
                use: ['css-hot-loader'].concat(ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins() {
                                    return [autoprefixer({ browsers: ['last 2 versions'] })];
                                }
                            }
                        },
                        'sass-loader'
                    ],
                }))
            },
            {
                test: /\.(eot|ttf|woff(2)?)/,
                exclude: /node_modules/,
                use: ['url-loader?limit=10000&name=[name].[ext]']
            }
        ]
    },
    plugins: [
        // This will reduce the size of the bundle by removing the unused languages in moment.js
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /us/),
        // This flags could be found @ https://github.com/lodash/lodash-webpack-plugin#feature-sets
        // and should be used properly in order to import only the features that we need from lodash.
        new LodashModuleReplacementPlugin({
            shorthands: true,
            // cloning: true,
            // currying: true,
            // caching: true,
            collections: true,
            // exotics: true,
            // guards: true,
            // metadata: true,
            // deburring: true,
            // unicode: true,
            // chaining: true,
            // memoizing: true,
            // coercions: true,
            // flattening: true,
            // paths: true,
            // placeholders: true
        }),
        new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            analyzerHost: '127.0.0.1',
            analyzerPort: 8888,
            openAnalyzer: false
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new ExtractTextPlugin({
            filename: '[name].dev.css',
            allChunks: true
        }),
        new HtmlWebpackPlugin({
            title: 'Dashboard - Dev Mode',
            template: './index.html',
            inject: 'body'
        })
    ],
    resolve: {
        modules: [
            path.resolve('./app'),
            path.resolve('./'),
            'node_modules'
        ]
    },
    devServer: {
        hot: true,
        port: 8080,
        host: '0.0.0.0',
        historyApiFallback: true
    }
};
