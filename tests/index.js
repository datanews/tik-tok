/**
 * JSHint doesn't like these mocha globals coming out of nowhere, add these
 * as needed:
 * describe:false, it:false, before:false, after:false,
 * beforeEach:false, and afterEach:false
 */

/* global describe:false, it:false */
'use strict';

// Dependencies.  See the following for assert reference
// https://nodejs.org/api/assert.html
var assert = require('assert');
var Timeline = require('../dist/timeline');

// Tests for Timeline object
describe('Timeline', function() {

  // Timeline object itself
  describe('#class', function() {
    it('should be a function', function() {
      assert.equal(true, (typeof Timeline !== 'undefined'));
      assert.equal(true, (typeof Timeline === 'function'));
    });
  });

  // Constructor
  describe('#constructor', function() {
    it('should throw an error without any events', function() {
      assert.throws(function() {
        var t = new Timeline();
        t = {};
      });
    });
  });

  // Metho column mapping
  describe('#mapColumns', function() {
    it('should map columns', function() {
      var events = [
        {
          'this is a date': '2014-05-01',
          'this is out title': 'Title!',
          'and our body is here': 'Over here!'
        }
      ];
      var expected = [
        {
          date: '2014-05-01',
          title: 'Title!',
          body: 'Over here!'
        }
      ];
      var columnMapping = {
        date: 'this is a date',
        title: 'this is out title',
        body: 'and our body is here'
      };
      var t = new Timeline({
        events: events,
        columnMapping: columnMapping
      });

      assert.deepEqual(t.mapColumns(events, columnMapping), expected);
    });
  });
});
