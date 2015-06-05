// Karma configuration
// Generated on Mon Jun 01 2015 17:02:23 GMT-0500 (CDT)

'use strict';

// Sauce lab launchers
var sauceLabLaunchers = {
  slChrome: {
    base: 'SauceLabs',
    browserName: 'chrome'
  },
  slIE10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '10'
  },
  slIE11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  slFirefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '30'
  }
  /*,
  slIOSSafari: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.9',
    version: '7.1'
  }
  */
};

// Base, local configuration
var configuration = {
  // base path that will be used to resolve all patterns (eg. files, exclude)
  basePath: '../',

  // frameworks to use
  // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
  frameworks: ['mocha'],

  // list of files / patterns to load in the browser.
  files: [
    'bower_components/mocha/mocha.js',
    'bower_components/chai/chai.js',
    'bower_components/underscore/underscore-min.js',
    'bower_components/moment/moment.js',
    'dist/*.js',
    'tests/**/*.js'
  ],

  // list of files to exclude
  exclude: [
    'tests/*.conf.js'
  ],

  // preprocess matching files before serving them to the browser
  // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  preprocessors: {
  },

  // test results reporter to use
  // possible values: 'dots', 'progress'
  // available reporters: https://npmjs.org/browse/keyword/karma-reporter
  reporters: ['progress'],

  // web server port
  port: 9876,

  // enable / disable colors in the output (reporters and logs)
  colors: true,

  // enable / disable watching file and executing tests whenever any file changes
  autoWatch: false,

  // start these browsers
  // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  browsers: ['PhantomJS', 'Chrome'],

  // Continuous Integration mode
  // if true, Karma captures browsers, runs the tests and exits
  singleRun: true
};

// If in Travis, just run PhantomJS
if (process.env.TRAVIS) {
  configuration.browsers = ['PhantomJS'];
}

// If we are in Travis and Sauce stuff is there
if (process.env.TRAVIS && process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  configuration.customLaunchers = sauceLabLaunchers;
  configuration.reporters = ['progress', 'saucelabs'];
  configuration.browsers = Object.keys(sauceLabLaunchers);
  configuration.sauceLabs = {
    testName: 'Tik Tok browser tests'
  };

  //configuration.logLevel = 'debug';
  configuration.captureTimeout = 120000;
  configuration.port = 9876;
}

// Make actual config happen
module.exports = function(config) {
  config.set(configuration);
};
