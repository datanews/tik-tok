/**
 * JSHint doesn't like these mocha globals coming out of nowhere, add these
 * as needed:
 * describe:false, it:false, before:false, after:false,
 * beforeEach:false, and afterEach:false
 */

/* global describe:false, it:false */
'use strict';

// Dependencies
var assert = require('assert');

// Basic timeline parts
describe('Basic Timeline', function() {
  var T = require('../dist/timeline');

  describe('#object', function() {
    it('should be an object', function() {
      assert.equal(true, (typeof T !== 'undefined'));
      assert.equal(true, (typeof T === 'object'));
    });
  });
});
