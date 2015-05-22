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
      var events = [{ date: 'this is not valid', title: 'Title!', body: 'Over here!' }];

      assert.throws(function() {
        t = new Timeline({
          events: events
        });
      });
    });

    // Throws error with bad key mapping
    it('should throw an error if bad key mapping are given', function() {
      var t;
      var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
      var keyMapping = 'key-mapping';

      assert.throws(function() {
        t = new Timeline({
          events: events,
          keyMapping: keyMapping
        });
      });
    });

    // Throws error with bad csvDelimiter
    it('should throw an error if bad csvDelimiter string is given', function() {
      var t;
      var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];

      assert.throws(function() {
        t = new Timeline({
          events: events,
          csvDelimiter: 'too long'
        });
      });
    });

    // Throws error with bad csvQuote
    it('should throw an error if bad csvQuote string is given', function() {
      var t;
      var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];

      assert.throws(function() {
        t = new Timeline({
          events: events,
          csvQuote: undefined
        });
      });
    });

    // Throws error with bad template
    it('should throw an error if bad template string is given', function() {
      var t;
      var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
      var template = '<% if x %>';

      assert.throws(function() {
        t = new Timeline({
          events: events,
          template: template
        });
      });
    });

    // Should not throw errors with valid data
    it('should not throw an error with valid event (JSON) data', function() {
      var t;
      var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];

      assert.doesNotThrow(function() {
        t = new Timeline({
          events: events
        });
      });
    });

    // Should not throw errors with valid csv data
    it('should not throw an error with valid event (CSV) data', function() {
      var t;
      var events = 'date,title,body\r\n' +
        '2014-04-04,title 1,body 1\r\n' +
        '2000-04-04,title 2,body 2';

      t = new Timeline({
        events: events
      });

      assert.doesNotThrow(function() {
        t = new Timeline({
          events: events
        });
      });
    });
  });

  // Check browser
  describe('#checkBrowser', function() {
    it('should (not) be browser', function() {
      var isBrowser = !(module && module.exports);
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];
      var t;

      t = new Timeline({
        events: events
      });

      assert.equal(t.checkBrowser(), isBrowser);
    });
  });

  // Method key mapping
  describe('#mapKeys', function() {
    it('should map different keys', function() {
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
      var keyMapping = {
        date: 'this is a date',
        title: 'this is out title',
        body: 'and our body is here'
      };
      var t = new Timeline({
        events: events,
        keyMapping: keyMapping
      });

      assert.deepEqual(t.mapKeys(events, keyMapping), expected);
    });

    // Should be fine if keys are what they should be
    it('should map same keys', function() {
      var events = [
        {
          date: '2014-05-01',
          title: 'Title!',
          body: 'Over here!'
        }
      ];
      var t = new Timeline({
        events: events,
        keyMapping: {}
      });

      assert.deepEqual(t.mapKeys(events, {}), events);
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

  // Sort groups
  describe('#sortGroups', function() {
    // Sort groups
    it('should sort groups (ascending)', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.sortGroups(t.groups)[0].id, '2014-03');
      assert.equal(t.sortGroups(t.groups)[1].id, '2014-05');
    });

    // Sort events
    it('should sort events (ascending)', function() {
      var t;
      var events = [
        { date: '2014-05-02', title: 'Second', body: 'This is 2' },
        { date: '2014-05-03', title: 'Third', body: 'This is 3' },
        { date: '2014-05-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.sortGroups(t.groups)[0].events[0].title, 'First');
      assert.equal(t.sortGroups(t.groups)[0].events[1].title, 'Second');
    });

    // Sort groups (desc)
    it('should sort groups (descending)', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];

      t = new Timeline({
        events: events
      });

      assert.equal(t.sortGroups(t.groups, true)[0].id, '2014-06');
      assert.equal(t.sortGroups(t.groups, true)[1].id, '2014-05');
    });
  });

  // Get elements
  describe('#getElement', function() {
    // Not in browser
    it('should return null if not in browser', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];
      var element = { nodeType: true };

      // Create object
      t = new Timeline({
        events: events
      });

      assert.equal(t.getElement(element), null);
    });

    // Use fake element
    it('should find element in browser', function() {
      var t;
      var events = [
        { date: '2014-05-01', title: 'Second', body: 'This is 2' },
        { date: '2014-06-01', title: 'Third', body: 'This is 3' },
        { date: '2014-03-01', title: 'First', body: 'This is 1' }
      ];
      var element = { nodeType: true };

      // Create object
      t = new Timeline({
        events: events
      });
      t.isBrowser = true;

      assert.deepEqual(t.getElement(element), element);
    });
  });

  // Media type
  describe('#determineMediaType', function() {
    var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
    var t = new Timeline({
      events: events
    });

    // No URL
    it('should return undefined if no URL is given', function() {
      var url;
      assert.equal(t.determineMediaType(url), undefined);
    });

    // Image
    it('should return image for image URL', function() {
      var url = 'https://placekitten.com/g/1200/510';
      assert.equal(t.determineMediaType(url), 'image');
    });

    // SoundCloud
    it('should return soundcloud for image URL', function() {
      var url = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/153891564&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false';
      assert.equal(t.determineMediaType(url), 'soundcloud');
    });

    // SoundCloud large
    it('should return soundcloud_large for image URL', function() {
      var url = 'https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/153891564&amp;auto_play=false&amp;hide_related=false&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true';
      assert.equal(t.determineMediaType(url), 'soundcloud_large');
    });

    // Youtube large
    it('should return youtube for image URL', function() {
      var url = 'https://www.youtube.com/embed/4IP_E7efGWE';
      assert.equal(t.determineMediaType(url), 'youtube');
    });
  });

  // Regex escapte
  describe('#regexEscape', function() {
    var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
    var t = new Timeline({
      events: events
    });

    // Parse CSV
    it('should escape Regex characters', function() {
      var chars = ['[', '-', '[', '\\', ']', '{', '}', '(', ')', '*', '+', '?', '.', ',', '^', '$', '|', '#'];

      chars.forEach(function(c) {
        assert.equal(t.regexEscape(c), '\\' + c);
      });
    });
  });

  // Make identifier
  describe('#makeIdentifier', function() {
    var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
    var t = new Timeline({
      events: events
    });

    // Parse CSV
    it('should make identifiers', function() {
      var sets = [
        ['      ', ''],
        ['This is a title.', 'this-is-a-title'],
        ['CAPS and $%^&* 123456', 'caps-and-123456'],
        [' \r\n thing    ', 'thing']
      ];

      sets.forEach(function(s) {
        assert.equal(t.makeIdentifier(s[0]), s[1]);
      });
    });
  });

  // Parse a CSV
  describe('#parseCSV', function() {
    var events = [{ date: '2015-01-03', title: 'Title!', body: 'Over here!' }];
    var t = new Timeline({
      events: events
    });

    // Parse CSV
    it('should parse a CSV', function() {
      var csv = 'date,title,body\r\n' +
        '2012-01-01,"title 1","body with a ,"\r\n' +
        '2012/04/22, TITLE, body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a ,' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv), expected);
    });

    // Different delimiter
    it('should parse a CSV (with a | delimiter)', function() {
      var csv = 'date|title|body\r\n' +
        '2012-01-01|"title 1"|"body with a | and double ""."\r\n' +
        '2012/04/22| TITLE| body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a | and double ".' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv, '|'), expected);
    });

    // Different delimiter
    it('should parse a CSV (with a ? delimiter)', function() {
      var csv = 'date?title?body\r\n' +
        '2012-01-01?"title 1"?"body with a ?"\r\n' +
        '2012/04/22? TITLE? body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a ?' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv, '?'), expected);
    });

    // Different delimiter
    it('should parse a CSV (with a @ delimiter)', function() {
      var csv = 'date@title@body\r\n' +
        '2012-01-01@"title 1"@"body with a @"\r\n' +
        '2012/04/22@ TITLE@ body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a @' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv, '@'), expected);
    });

    // Different quote
    it('should parse a CSV (with a : quote)', function() {
      var csv = 'date@title@body\r\n' +
        '2012-01-01@:title 1:@:body with a @:\r\n' +
        '2012/04/22@ TITLE@ body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a @' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv, '@', ':'), expected);
    });

    // Different quote
    it('should parse a CSV (with a % quote)', function() {
      var csv = 'date@title@body\r\n' +
        '2012-01-01@%title 1%@%body with a @%\r\n' +
        '2012/04/22@ TITLE@ body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a @' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv, '@', '%'), expected);
    });

    // Different line breaks
    it('should parse a CSV (with a different line break)', function() {
      var csv = 'date,title,body\r' +
        '2012-01-01,"title 1","body with a ,"\r' +
        '2012/04/22, TITLE, body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a ,' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv), expected);
    });

    // Throw an error
    it('should throw an error given bad data', function() {
      var csv = 'this is not useful data';

      assert.throws(function() {
        t.parseCSV(csv);
      });
    });

    // Parse CSV extra line breaks
    it('should parse a CSV with extra line breaks', function() {
      var csv = 'date,title,body\r\n' +
        '2012-01-01,"title 1","body with a ,"\r\n' +
        '2012/04/22, TITLE, body stuff\r\n';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a ,' },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff' }
      ];

      assert.deepEqual(t.parseCSV(csv), expected);
    });

    // Parse CSV with extra columns
    it('should parse a CSV with extra columns', function() {
      var csv = 'date,title,body,media,source\r\n' +
        '2012-01-01,"title 1","body with a ,"\r\n' +
        '2012/04/22, TITLE, body stuff';

      var expected = [
        { date: '2012-01-01', title: 'title 1', body: 'body with a ,', media: undefined, source: undefined },
        { date: '2012/04/22', title: 'TITLE', body: 'body stuff', media: undefined, source: undefined }
      ];

      assert.deepEqual(t.parseCSV(csv), expected);
    });
  });
});
