const path = require('path');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    devServer: {
        contentBase: path.join(__dirname, './web'),
        compress: true,
        port: 4000,
        disableHostCheck: true,
        historyApiFallback: true,
    },
    entry: path.join(__dirname, './index.js'),
    output: {
        path: path.join(__dirname, './web'),
        publicPath: '/',
        filename: '[name].bundle.js',
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './node_modules/ton-client-web-js/tonclient.wasm' },
        ]),
        new webpack.LoaderOptionsPlugin({
            minimize: false,
            debug: true,
        }),
    ],
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                include: [
                    path.resolve('index.js'),
                    path.resolve(__dirname, './node_modules/webpack-dev-server'),
                    path.resolve(__dirname, './node_modules/ton-client-js'),
                    path.resolve(__dirname, './node_modules/ton-client-web-js'),
                ],
                loader: 'babel-loader',
                query: {
                    cacheDirectory: true,
                    presets: [
                        '@babel/preset-env'
                    ],
                    plugins: [
                        ['@babel/plugin-transform-flow-strip-types'],
                        ['@babel/plugin-proposal-decorators', { legacy: true }],
                        ['@babel/plugin-proposal-class-properties', { loose: true }],
                        '@babel/plugin-proposal-do-expressions',
                        '@babel/plugin-proposal-export-default-from',
                        '@babel/plugin-proposal-export-namespace-from',
                        '@babel/plugin-proposal-function-bind',
                        '@babel/plugin-proposal-function-sent',
                        '@babel/plugin-proposal-json-strings',
                        '@babel/plugin-proposal-logical-assignment-operators',
                        '@babel/plugin-proposal-nullish-coalescing-operator',
                        '@babel/plugin-proposal-numeric-separator',
                        '@babel/plugin-proposal-optional-chaining',
                        ['@babel/plugin-proposal-pipeline-operator', { proposal: 'minimal' }],
                        '@babel/plugin-proposal-throw-expressions',
                        '@babel/plugin-syntax-bigint',
                        '@babel/plugin-syntax-dynamic-import',
                        '@babel/plugin-syntax-import-meta',
                        '@babel/plugin-transform-arrow-functions',
                        '@babel/plugin-transform-async-to-generator',
                        '@babel/plugin-transform-block-scoping',
                        '@babel/plugin-transform-classes',
                        '@babel/plugin-transform-runtime',
                    ],
                },
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.node$/,
                use: 'node-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.ts', '.tsx', '.js', '.jsx', '.json', '.json5', '.node', '.wasm'],
    },
};
