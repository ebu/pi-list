const webpack = require('webpack');
const path = require('path');
const autoprefixer = require('autoprefixer');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
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
        path: path.resolve('./dist/'),
        filename: '[name].[chunkhash:6].min.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: 'babel-loader',
                options: {
                    plugins: [
                        'transform-react-inline-elements',
                        'babel-plugin-transform-react-remove-prop-types'
                    ]
                }
            },
            {
                test: /\.s?css$/,
                use: ExtractTextPlugin.extract({
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
                })
            },
            {
                test: /\.(eot|ttf|woff(2)?)/,
                exclude: /node_modules/,
                use: ['url-loader?limit=10000&name=[name].[ext]']
            }
        ]
    },
    plugins: [
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /us/),
        new LodashModuleReplacementPlugin({
            collections: true,
            shorthands: true,
        }),
        new webpack.optimize.CommonsChunkPlugin('vendor'),
        new webpack.DefinePlugin({
            'process.env': {
                NODE_ENV: JSON.stringify('production')
            }
        }),
        new ExtractTextPlugin({
            filename: 'list.[chunkhash:6].min.css',
            allChunks: true
        }),
        new CopyWebpackPlugin([
            {
                from: 'favicon.ico'
            }, {
                from: 'static',
                to: 'static'
            }
        ]),
        new webpack.optimize.UglifyJsPlugin({
            output: {
                comments: false,
            },
            compress: {
                drop_console: true,
                drop_debugger: true,
                warnings: false,
            }
        }),
        new HtmlWebpackPlugin({
            title: 'Dashboard',
            template: './index.html',
            inject: 'body'
        })
    ],
    resolve: {
        modules: [
            path.resolve('./app'),
            path.resolve('./'),
            'node_modules'
        ],
    }
};
