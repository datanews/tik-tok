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

// Create banner to insert into files
var pkg = require('./package.json');
var banner = ['/**',
  ' * <%= pkg.name %> - <%= pkg.description %>',
  ' * @version v<%= pkg.version %>',
  ' * @link <%= pkg.homepage %>',
  ' * @license <%= pkg.license %>',
  ' */',
  ''].join('\n');

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
  return gulp.src('gulpfile.js')
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs());
});

// Main JS task for timeline library.  Takes in files from src and outputs
// to dist.  Uses JSHint, JSCS, add header, ...
gulp.task('js', function() {
  // Lint and create un-minified version
  gulp.src('src/**/*.js')
    .pipe(plumber(plumberHandler))
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'))
    .pipe(jscs())
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'));

  // Create minified version
  gulp.src('src/**/*.js')
    .pipe(uglify())
    .pipe(rename({
      extname: '.min.js'
    }))
    .pipe(header(banner, { pkg: pkg }))
    .pipe(gulp.dest('dist'));
});

// Default task is a basic build
gulp.task('default', ['support-js', 'js']);
