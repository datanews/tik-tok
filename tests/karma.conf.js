// Karma configuration
// Generated on Mon Jun 01 2015 17:02:23 GMT-0500 (CDT)

'use strict';

// Sauce lab launchers
// https://docs.saucelabs.com/reference/platforms-configurator/
var sauceLabLaunchers = {
  // Chrome
  slChromeWin: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 8.1'
  },
  slChromeOSX: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'OS X 10.10'
  },
  slChromeBeta: {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: 'beta'
  },

  // Firefox
  slFFWin: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 8.1'
  },
  slFFOSX: {
    base: 'SauceLabs',
    browserName: 'firefox',
    platform: 'OS X 10.10'
  },
  slFFBeta: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: 'beta'
  },

  // IE
  slIE9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '9'
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

  // Safari
  slSafari8: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.10',
    version: '8.0'
  },
  slSafari7: {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.9',
    version: '7.0'
  },

  // Mobile safari
  slIOSSafari82: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '8.2',
    deviceName: 'iPhone Simulator'
  },
  slIOSSafari81: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '8.1',
    deviceName: 'iPhone Simulator'
  },
  slIOSSafari71: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.10',
    version: '7.1',
    deviceName: 'iPhone Simulator'
  }

  // Android (seem to be an issue)
  /*
  slAndroid51: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '5.1',
    deviceName: 'Android Emulator'
  },
  slAndroidNexus44: {
    base: 'SauceLabs',
    browserName: 'android',
    platform: 'Linux',
    version: '4.4',
    deviceName: 'Google Nexus 7 HD Emulator'
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

// If the Sauce Labs vars are set (in Travis or not), run that.  We try
// to make the name and the build number unique so that Sauce can handle
if (process.env.SAUCE_USERNAME && process.env.SAUCE_ACCESS_KEY) {
  configuration.customLaunchers = sauceLabLaunchers;
  configuration.reporters = ['progress', 'saucelabs'];
  configuration.browsers = Object.keys(sauceLabLaunchers);
  configuration.sauceLabs = {
    testName: 'Tik Tok #' + (process.env.TRAVIS_BUILD_NUMBER || 'local') +
      (process.env.TRAVIS_NODE_VERSION ? '-' + process.env.TRAVIS_NODE_VERSION : ''),
    build: (process.env.TRAVIS_BUILD_NUMBER || 'local') +
      (process.env.TRAVIS_NODE_VERSION ? '-' + process.env.TRAVIS_NODE_VERSION : '')
  };

  //configuration.logLevel = 'debug';
  configuration.captureTimeout = 120000;
  configuration.port = 9876;
}

// Make actual config happen
module.exports = function(config) {
  config.set(configuration);
};
