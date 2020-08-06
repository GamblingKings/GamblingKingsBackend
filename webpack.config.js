/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const slsw = require('serverless-webpack');
const nodeExternals = require('webpack-node-externals');

const { isLocal } = slsw.lib.webpack;

module.exports = {
  mode: isLocal ? 'development' : 'production',
  devtool: isLocal ? 'source-map' : 'none',
  entry: slsw.lib.entries,
  target: 'node',
  resolve: {
    extensions: ['.mjs', '.ts', '.js'],
  },
  output: {
    libraryTarget: 'commonjs2',
    path: path.join(__dirname, '.webpack'),
    filename: '[name].js',
  },
  externals: [nodeExternals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: [/node_modules/, /__test__/],
        loader: 'ts-loader',
      },
    ],
  },
  watch: true,
  watchOptions: {
    aggregateTimeout: 0,
    ignored: ['__test__/**/*.test.ts', 'node_modules/**'],
  },
};
