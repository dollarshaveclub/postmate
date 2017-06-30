/* global __dirname, require, module*/

const webpack = require('webpack');
const UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;
const OptimizeJsPlugin = require('optimize-js-plugin');
const path = require('path');
const env = require('yargs').argv.env; // use --env with webpack 2
const info = require('./package.json');

const banner = `@overview ${info.name} - ${info.description}.
@copyright Copyright (c) ${(new Date()).getFullYear()} ${info.author.name}
@license   Licensed under ${info.license.type} license
           See ${info.license.url}
@version   ${info.version}`;

module.exports = [
  {
    entry: 'postmate',
    library: 'Postmate'
  },
  {
    entry: 'encrypted-postmate',
    library: 'EncryptedPostmate'
  }
].map(function (config) {
  let plugins = [], outputFile;

  if (env === 'build') {
    plugins.push(new UglifyJsPlugin());
    plugins.push(new OptimizeJsPlugin({
      sourceMap: false
    }));
    plugins.push(new webpack.BannerPlugin(banner));
    outputFile = '[name].min.js';
  } else {
    outputFile = '[name].js';
  }

  return {
    entry: {
      [config.entry]: './src/' + config.entry + '.js'
    },
    devtool: 'source-map',
    output: {
      path: __dirname + '/build',
      filename: outputFile,
      library: config.library,
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
});
