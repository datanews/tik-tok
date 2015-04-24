/**
 * Gulp file for the timeline project.  This handles tasks like building,
 * linting, and other helpful development things.
 */
'use strict';

// Dependencies
var gulp = require('gulp');
var jshint = require('gulp-jshint');


// Support JS is a task to look at the supporting JS, like this
// file
gulp.task('support-js', function() {
  return gulp.src('gulpfile.js')
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

// Main JS task for timeline library
gulp.task('js', function() {
  return gulp.src('src/**/*.js')
    // JSHint files
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});


// Default task is a basic build
gulp.task('default', ['support-js', 'js']);
