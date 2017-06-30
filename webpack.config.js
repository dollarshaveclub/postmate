/* global __dirname, require, module*/

const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2

let plugins = [], outputFile;

if (env === 'build') {
  plugins.push(new UglifyJsPlugin({ minimize: true }));
  plugins.push(new BundleAnalyzerPlugin());
  outputFile = '[name].min.js';
} else {
  outputFile = '[name].js';
}

const config = {
  entry: {
    'Postmate': __dirname + '/src/postmate.js',
    'EncryptedPostmate': __dirname + '/src/encrypted-postmate.js'
  },
  devtool: 'source-map',
  output: {
    path: __dirname + '/build',
    filename: outputFile,
    library: '[name]',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    rules: [
      {
        test: /(\.jsx|\.js)$/,
        loader: 'babel-loader',
        exclude: /(node_modules|bower_components)/
      },
      {
        test: /(\.jsx|\.js)$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    modules: [path.resolve('./src'), path.resolve('./test'), path.resolve('node_modules')],
    extensions: ['.json', '.js']
  },
  plugins: plugins
};

module.exports = config;
