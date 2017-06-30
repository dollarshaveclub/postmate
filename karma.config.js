const webpackConfig = require('./webpack.config');

webpackConfig.entry = undefined;

module.exports = function (config) {
  config.set({
    frameworks: ['mocha'],

    files: [
      {
        pattern: 'test/*.spec.js',
        watched: false
      },
      {
        pattern: 'test/fixtures/*.js',
        included: false,
        watched: false
      },
      {
        pattern: 'test/fixtures/*.html',
        included: false,
        watched: false
      }
    ],

    client: {
      mocha: {
        reporter: 'html'
      }
    },

    preprocessors: {
      'test/*.spec.js': ['webpack'],
      'test/fixtures/*.js': ['webpack']
    },

    webpack: webpackConfig,

    webpackMiddleware: {
      stats: 'errors-only'
    }
  });
};
