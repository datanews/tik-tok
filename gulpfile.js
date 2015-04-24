/**
 * Gulp file for the timeline project.  This handles tasks like building,
 * linting, and other helpful development things.
 */
'use strict';

// Dependencies
var gulp = require('gulp');
var jshint = require('gulp-jshint');
var jscs = require('gulp-jscs');
var plumber = require('gulp-plumber');
var util = require('gulp-util');
var header = require('gulp-header');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var less = require('gulp-less');
var recess = require('gulp-recess');
var cssminify = require('gulp-minify-css');
var autoprefixer = require('gulp-autoprefixer');
var webserver = require('gulp-webserver');

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
  return gulp.src('*.js')
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
});

// Main JS task for timeline library.  Takes in files from src and outputs
// to dist.  Uses JSHint, JSCS, add header, minify
gulp.task('js', function() {
  gulp.src('src/**/*.js')
    .pipe(plumber(plumberHandler))
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
  gulp.src('src/**/*.less')
    .pipe(plumber(plumberHandler))
    .pipe(recess())
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
  gulp.watch('src/*.js', ['js']);
  gulp.watch('src/**/*.js', ['js']);
  gulp.watch('src/**/*.less', ['styles']);
});

// Web server for conveinence
gulp.task('webserver', function() {
  gulp.src('./')
    .pipe(webserver({
      port: 8089,
      livereload: true,
      directoryListing: true,
      open: true,
      fallback: 'index.html',
      filter: function(file) {
        // Watch dist and examples
        return (file.match(/dist|examples/)) ? true : false;
      }
    }));
});

// Default task is a basic build
gulp.task('default', ['support-js', 'js', 'styles']);

// Combine webserver and watch tasks for a more complete server
gulp.task('server', ['watch', 'webserver']);
