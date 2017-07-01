const env = require('yargs').argv.env; // use --env with webpack 2
const webpackConfig = require('./webpack.config')[0];

webpackConfig.entry = undefined;

const customLaunchers = {
  slChrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: '35'
  },
  slFirefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '30'
  },
  slMobileSafari: {
    base: 'SauceLabs',
    browserName: 'Safari',
    version: '9.3',
    platform: 'iOS',
    appiumVersion: '1.6.4',
    deviceName: 'iPhone 6s Simulator',
    deviceOrientation: 'portrait'
  },
  slAndroid: {
    base: 'SauceLabs',
    browserName: 'Browser',
    version: '4.4',
    platform: 'Android',
    appiumVersion: '1.6.4',
    deviceName: 'Samsung Galaxy S3 Emulator',
    deviceOrientation: 'portrait'
  },
  slEdge: {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    platform: 'Windows 10',
    version: '13.10586'
  }
};

module.exports = function (config) {
  config.set({
    sauceLabs: {
      testName: 'Encrypted Postmate',
      startConnect: false
    },
    frameworks: ['mocha'],
    customLaunchers: customLaunchers,
    browsers: env === 'build' ? Object.keys(customLaunchers) : ['Electron'],
    reporters: ['progress', 'saucelabs'],

    concurrency: 5,
    browserNoActivityTimeout: 30000,
    captureTimeout: 180000,

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
