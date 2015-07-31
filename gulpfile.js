/**
 * Gulp file for the Tik Tok project.  This handles tasks like building,
 * linting, and other helpful development things.
 */
'use strict';

// Dependencies
var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var plumber = require('gulp-plumber');
var replace = require('gulp-replace');
var util = require('gulp-util');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var less = require('gulp-less');
var recess = require('gulp-recess');
var cssminify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var webserver = require('gulp-webserver');
var mocha = require('gulp-mocha');
var karma = require('karma').server;

// Create banner to insert into files
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

// Browser support (for autoprefixer).  This should be more defined
// for the project as a whole
var supportedBrowsers = ['> 1%', 'last 2 versions', 'Firefox ESR', 'Opera 12.1'];

// Plumber allows for better error handling and makes it so that
// gulp doesn't crash so hard.  Good for watching and linting tasks
var plumberHandler = function(error) {
  if (error) {
    util.beep();
  }
  else {
    this.emit('end');
  }
};

// Support JS is a task to look at the supporting JS, like this
// file
gulp.task('support-js', function() {
  return gulp.src(['gulpfile.js', 'tests/**/*.js'])
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
});

// Run tests through Node.  This is quicker, and used for immediate
// development
gulp.task('test', ['js', 'support-js'], function() {
  return gulp.src('tests/**/*.js', { read: false })
    .pipe(plumber(plumberHandler))
    .pipe(mocha({
      ui: 'bdd',
      reporter: 'spec'
    }));
});

// Run tests in browsers
gulp.task('browser-test', ['js', 'support-js'], function(done) {
  return karma.start({
    configFile: path.join(__dirname + '/tests/karma.conf.js'),
    singleRun: true
  }, done);
});

// Main JS task.  Takes in files from src and outputs
// to dist.  Gets template and uses JSHint, JSCS, add header, minify
gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    .pipe(plumber(plumberHandler))
    .pipe(replace(
      'REPLACE-DEFAULT-TEMPLATE',
      fs.readFileSync('src/tik-tok.tpl.html', {
        encoding: 'utf-8'
      }).replace(/'/g, '\\\'').replace(/(\r\n|\n|\r|\s+)/g, ' ')
    ))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(uglify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(gulp.dest('dist'));
});

// Styles.  Recess linting, Convert LESS to CSS, minify
gulp.task('styles', function() {
  return gulp.src('src/**/*.less')
    .pipe(plumber(plumberHandler))
    .pipe(recess({
      noOverqualifying: false,
      noUniversalSelectors: false
    }))
    .pipe(less())
    .pipe(recess.reporter({
      fail: true
    }))
    .pipe(autoprefixer({
      browsers: supportedBrowsers
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'))
    .pipe(cssminify())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(rename({
      extname: '.min.css'
    }))
    .pipe(gulp.dest('dist'));
});

// Watch for files that need to be processed
gulp.task('watch', function() {
  gulp.watch(['gulpfile.js', 'tests/**/*.js'], ['support-js']);
  gulp.watch(['src/**/*.js', 'src/**/*.html'], ['js', 'test']);
  gulp.watch(['tests/**/*.js'], ['test']);
  gulp.watch('src/**/*.less', ['styles']);
});

// Web server for conveinence
gulp.task('webserver', function() {
  return gulp.src('./')
    .pipe(webserver({
      port: 8089,
      livereload: {
        enable: true,
        filter: function(file) {
          // Only watch dist and examples
          return (file.match(/dist|examples|index\.html/)) ? true : false;
        }
      },
      directoryListing: true,
      open: true
    }));
});

// Default task is a basic build
gulp.task('default', ['support-js', 'js', 'test', 'browser-test', 'styles']);

// No browser test build
gulp.task('no-brower-build', ['support-js', 'js', 'test', 'styles']);

// Combine webserver and watch tasks for a more complete server
gulp.task('server', ['no-brower-build', 'watch', 'webserver']);
