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
    // Throws and error with no event data
    it('should throw an error without any events', function() {
      var t;

      assert.throws(function() {
        t = new Timeline();
      });
    });

    // Throws error with bad date
    it('should throw an error if bad dates are given', function() {
      var t;
      var events = [
        {
          date: 'this is not valid',
          title: 'Title!',
          body: 'Over here!'
        }
      ];

      assert.throws(function() {
        t = new Timeline({
          events: events
        });
      });
    });

    // Should not throw errors with valid data
    it('should not throw an error with valid event data', function() {
      var t;
      var events = [
        {
          date: '2015-01-03',
          title: 'Title!',
          body: 'Over here!'
        }
      ];
      assert.doesNotThrow(function() {
        t = new Timeline({
          events: events
        });
      });
    });
  });

  // Method column mapping
  describe('#mapColumns', function() {
    it('should map different columns', function() {
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

    // Should be fine if columns are what they should be
    it('should map same columns', function() {
      var events = [
        {
          date: '2014-05-01',
          title: 'Title!',
          body: 'Over here!'
        }
      ];
      var t = new Timeline({
        events: events,
        columnMapping: {}
      });

      assert.deepEqual(t.mapColumns(events, {}), events);
    });
  });

  // Determine groups
  describe('#determineGroups', function() {
    // Group these events by months
    it('should determine group to be months', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.groupType, 'months');
    });

    // Group these events by years
    it('should determine group to be years', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2015-06-01', title: 'Third', body: 'This is 3' },
        { date: '2013-03-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.groupType, 'years');
    });

    // Group these events by decades
    it('should determine group to be decades', function() {
      var t;
      var events = [
        { date: '1990-05-01', title: 'Second', body: 'This is 2' },
        { date: '2000-06-01', title: 'Third', body: 'This is 3' },
        { date: '1980-03-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.groupType, 'decades');
    });
  });

  // Group events
  describe('#groupEvents', function() {
    // Group these events by months
    it('should group events by months', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];
      var expected = '2014-05';

      t = new Timeline({
        events: events
      });

      assert.equal(t.groupEvents(t.events)[0].id, expected);
    });
  });
});
