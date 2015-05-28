/* global define:false */

'use strict';

// Wrap so that we can support different module loaders
(function(root, factory) {
  // Common JS (i.e. browserify) or Node.js environment
  if (typeof module !== 'undefined' && module.exports && typeof require === 'function') {
    module.exports = factory(require('underscore'), require('moment'));
  }
  else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['underscore', 'moment'], factory);
  }
  else {
    // Brower global
    root.Timeline = factory(root._, root.moment);
  }
})(typeof window !== 'undefined' ? window : this, function(_, moment) {
  // Check depdencies
  if (typeof _ === 'undefined') {
    throw new Error('Underscore is a necessary dependency of Timeline: http://underscorejs.org/');
  }

  if (typeof moment === 'undefined') {
    throw new Error('Moment is a necessary dependency of Timeline: http://momentjs.com/');
  }

  // Place to hold ID generation counts
  var idCounts = {};

  // Default options
  var defaultOptions = {
    // Date formats used by moment
    dateFormat: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD'],

    // Date display format
    dateDisplay: 'MMM DD, YYYY',

    // Put order of entries in descending order (newest to oldest).  The default
    // is off, ascending (oldest to newest)
    descending: false,

    // CSV delimiting character
    csvDelimiter: ',',

    // CSV quote character
    csvQuote: '"',

    // Template.  This can be a function or string and the default will
    // be replace in the build process
    template: 'REPLACE-DEFAULT-TEMPLATE'
  };

  // Constructior
  var Timeline = function(options) {
    this.options = _.extend({}, defaultOptions, options || {});

    // Check event data
    if (!_.isArray(this.options.entries) && !_.isString(this.options.entries)) {
      throw new Error('"entries" data should be provided as a string or array.');
    }

    // Ensure column mapping is an object
    if (this.options.keyMapping && !_.isObject(this.options.keyMapping)) {
      throw new Error('"keyMapping" was not provided as an object.');
    }

    // Ensure there is a template
    if (!_.isString(this.options.template) && !_.isFunction(this.options.template)) {
      throw new Error('"template" was not provided as a string or function.');
    }

    // Ensure CSV characters are single characters, not that the parsing
    // couldn't probably handle it, but why make it more complex
    if (!_.isString(this.options.csvDelimiter) || this.options.csvDelimiter.length !== 1) {
      throw new Error('"csvDelimiter" was not provided as a single character string.');
    }

    if (!_.isString(this.options.csvQuote) || this.options.csvQuote.length !== 1) {
      throw new Error('"csvQuote" was not provided as a single character string.');
    }

    // Try to build template if string
    if (_.isString(this.options.template)) {
      try {
        this.options.template = _.template(this.options.template);
      }
      catch (e) {
        throw new Error('Error parsing template string with underscore templating: ' + e.message);
      }
    }

    // Force boolean on date order
    this.options.descending = !!this.options.descending;

    // Determine if browser
    this.isBrowser = this.checkBrowser();

    // Check that element is given if in browser
    if (this.isBrowser && !this.options.el) {
      throw new Error('"el" needs to br provided as a string or object.');
    }

    // Get element
    this.el = this.getElement(this.options.el);

    // Check that an element was found if in browser
    if (this.isBrowser && !this.el) {
      throw new Error('Could not find a valid element from the given "el" option.');
    }

    // If the event data was provided as a string, attempt to parse as
    // CSV
    if (_.isString(this.options.entries)) {
      this.options.entries = this.parseCSV(this.options.entries,
        this.options.csvDelimiter, this.options.csvQuote);
    }

    // Map columns and attach entries to object for easier access.
    // Should be in format { needed: provided }
    this.entries = this.mapKeys(this.options.entries, this.options.keyMapping);

    // Parse entries like dates
    this.entries = this.parseEntries(this.entries);

    // Group entries.
    this.groups = this.groupEntries(this.entries);

    // Sort groups
    this.groups = this.sortGroups(this.groups, this.options.descending);

    // If browser, do some DOM things and render
    if (this.isBrowser) {
      // Get the id from the element or create an id for the timeline
      // as there may be multiple timelines on the same page
      this.id = this.el.id || this.uniqueId('timeline');
      this.el.id = this.id;

      // Render
      this.render();
    }
  };

  // Add methods
  _.extend(Timeline.prototype, {
    // Main renderer
    render: function() {
      var _this = this;

      this.el.innerHTML = this.options.template({
        _: _,
        groups: this.groups,
        title: this.options.title,
        timeline: this
      });

      // Go to specific event, check if part of this timeline.  This check
      // is not perfect
      if (window.location.hash && window.location.hash.indexOf('#' + this.id) === 0) {
        this.scrollTo(window.location.hash);
      }

      // Add entries to scroll to specific event when link is
      // clicked.  This is a bit nicer and consistent with load.
      _.each(this.el.querySelectorAll('a.event-link'), function(a) {
        a.addEventListener('click', function(e) {
          e.preventDefault();
          var hash = this.getAttribute('href');
          history.pushState(null, null, hash);
          _this.scrollTo(hash);
        });
      });

      // Gather placement of entries and timeline in order to determine
      // where the user is on the timeline
      this.determinePlacements();

      // Get mini timeline elements
      this.miniEl = this.getElement('#' + this.id + ' .mini-timeline');
      this.progressEl = this.getElement('#' + this.id + ' .mini-timeline-progress');

      // Watch scrolling to update progress bar
      document.addEventListener('scroll', _.bind(this.updateProgress, this));
    },

    // Update progress bar
    updateProgress: function() {
      var currentView = document.body.scrollTop;

      // Determine if in timeline at all
      if (currentView >= this.top && currentView <= this.bottom) {
        this.miniEl.classList.add('enabled');
      }
      else {
        this.miniEl.classList.remove('enabled');
      }
    },

    // Get element from some sort of selector or element.  Inspiration
    // from Ractive
    getElement: function(input) {
      var output;

      // Check if we are in a browser
      if (!this.isBrowser || !input) {
        return null;
      }

      // We already have a DOM node - no work to do.
      if (input.nodeType) {
        return input;
      }

      // Get node from string
      if (typeof input === 'string') {
        // try ID first
        output = document.getElementById(input);

        // then as selector, if possible
        if (!output && document.querySelector) {
          output = document.querySelector(input);
        }

        // Did it work?
        if (output && output.nodeType) {
          return output;
        }
      }

      // If we've been given a collection (jQuery, Zepto etc),
      // extract the first item
      if (input[0] && input[0].nodeType) {
        return input[0];
      }

      return null;
    },

    // Simple test for browser (used mostly for testing in Node)
    checkBrowser: function() {
      return (typeof window !== 'undefined' && document);
    },

    // Sort groups (and entries in groups).  Sorts ascending (oldest to newest)
    // by default, but can do descending.
    sortGroups: function(groups, descending) {
      descending = descending || false;

      // Sort entries
      groups = _.map(groups, function(g) {
        g.entries = _.sortBy(g.entries, function(e) {
          return e.date.unix() * ((descending) ? -1 : 1);
        });

        return g;
      });

      // Sort groups
      return _.sortBy(groups, function(g) {
        return g.date.unix() * ((descending) ? -1 : 1);
      });
    },

    // Group entries based on grouping function.  A grouping function
    // should take an event and return an object with the following
    // properties: `id`, `date`  (as moment object), `display`
    groupEntries: function(entries) {
      var groups = {};
      var groupByFunc;

      // Determine group
      this.groupType = this.determineGroups(this.entries);

      // Get grouping function
      groupByFunc = 'groupBy' + this.groupType.charAt(0).toUpperCase() +
        this.groupType.slice(1);
      groupByFunc = this[groupByFunc];

      // Go through each event and create or add to group
      _.each(entries, function(e) {
        var g = _.bind(groupByFunc, this)(e, moment);

        if (groups[g.id]) {
          groups[g.id].entries.push(e);
        }
        else {
          groups[g.id] = g;
          groups[g.id].entries = [e];
        }
      });

      return _.values(groups);
    },

    // Group by for months
    groupByMonths: function(event, moment) {
      return {
        id: event.date.format('YYYY-MM'),
        date: moment(event.date.format('YYYY-MM'), 'YYYY-MM'),
        display: moment(event.date.format('YYYY-MM'), 'YYYY-MM').format('MMM, YYYY')
      };
    },

    // Group by for years
    groupByYears: function(event, moment) {
      return {
        id: event.date.format('YYYY'),
        date: moment(event.date.format('YYYY'), 'YYYY'),
        display: moment(event.date.format('YYYY'), 'YYYY').format('YYYY')
      };
    },

    // Group by for decades
    groupByDecades: function(event, moment) {
      var decade = Math.floor(event.date.year() / 10) * 10;
      return {
        id: decade.toString(),
        date: moment(decade.toString(), 'YYYY'),
        display: moment(decade.toString(), 'YYYY').format('YYYY\'s')
      };
    },

    // Determine groups
    determineGroups: function(entries) {
      // Some functions
      var getDate = function(e) { return e.date.unix(); };

      // Determine span and grouping
      var min = _.min(entries, getDate);
      var max = _.max(entries, getDate);
      var diff = max.date.diff(min.date, 'years');

      return (diff < 2) ? 'months' :
        (diff < 10) ? 'years' : 'decades';
    },

    // Parse entries
    parseEntries: function(entries) {
      return _.map(entries, _.bind(function(e) {
        // Parse date
        var d = moment(e.date, this.options.dateFormat);
        if (!d.isValid()) {
          this.warn('Error parsing date from "' + e.date + '"', e);
        }

        e.date = d;

        // Create an ID
        e.id = this.uniqueId(this.makeIdentifier(e.title));

        // Determine type of media from media url if mediaType has not
        // been provided
        e.mediaType = e.mediaType || this.determineMediaType(e.media);

        // Create a formatted version of date for template
        e.dateFormatted = d.format(this.options.dateDisplay);

        return e;
      }, this));
    },

    // Given a URL, determine how to handle it.  The default is treat
    // the URL as an image, otherwise
    determineMediaType: function(url) {
      // None
      if (!url) {
        return undefined;
      }

      // Youtube
      else if (url.indexOf('youtube.com') !== -1) {
        return 'youtube';
      }

      // SoundCloud larger/visual
      else if (url.indexOf('soundcloud.com') !== -1 && url.indexOf('visual=true') !== -1) {
        return 'soundcloud_large';
      }

      // SoundCloud regular
      else if (url.indexOf('soundcloud.com') !== -1) {
        return 'soundcloud';
      }

      // Image
      else {
        return 'image';
      }
    },

    // For each event, determine where it is on the page
    // so that we can know where the user is in the timeline.
    //
    // Top and bottom of elements can be inaccurate as items,
    // like images may not be loaded yet.
    determinePlacements: function() {
      var _this = this;

      // Determine top and bottom of timeline
      this.top = this.el.getBoundingClientRect().top + window.pageYOffset;
      this.bottom = this.el.getBoundingClientRect().bottom + window.pageYOffset;

      // Determine top and bottom of entries
      this.entries = _.map(this.entries, function(e) {
        e.el = _this.getElement(_this.id + '-' + e.id);
        e.top = e.el.getBoundingClientRect().top + window.pageYOffset;
        e.bottom = e.el.getBoundingClientRect().bottom + window.pageYOffset;

        return e;
      });
    },

    // Map columns
    mapKeys: function(entries, mapping) {
      mapping = mapping || {};

      // Go through each event, clone, change mappings, and remove old
      return _.map(entries, function(e) {
        var n = _.clone(e);

        // Find a mapping
        _.each(mapping, function(m, mi) {
          if (!_.isUndefined(e[m]) && m !== mi) {
            n[mi] = _.clone(e[m]);
            delete n[m];
          }
        });

        return n;
      });
    },

    // This will parse a csv string into an array of array.  Default
    // delimiter is a comma and quote character is double quote
    //
    // Inspired from: http://stackoverflow.com/a/1293163/2343
    parseCSV: function(csv, delimiter, quote) {
      delimiter = delimiter || ',';
      quote = quote || '"';
      var d = this.regexEscape(delimiter);
      var q = this.regexEscape(quote);

      // Remove any extra line breaks
      csv = csv.replace(/^\s+|\s+$/g, '');

      // Regular expression to parse the CSV values.
      var pattern = new RegExp((

        // Delimiters.
        '(' + d + '|\\r?\\n|\\r|^)' +

        // Quoted fields.
        '(?:' + q + '([^' + q + ']*(?:' + q + q + '[^' + q + ']*)*)' + q + '|' +

        // Standard fields.
        '([^' + q + '' + d + '\\r\\n]*))'
      ), 'gi');

      // For holding match data
      var parsed = [[]];
      var matches = pattern.exec(csv);

      // For getting properties
      var headers;

      // Keep looping over the regular expression matches
      // until we can no longer find a match.
      while (matches) {
        var matchedDelimiter = matches[1];
        var matchedValue;

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (matchedDelimiter.length && matchedDelimiter !== delimiter) {
          // Since we have reached a new row of data,
          // add an empty row to our data array.
          parsed.push([]);
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (matches[2]) {
          // We found a quoted value. When we capture
          // this value, reduce any double occurences to one.
          matchedValue = matches[2].replace(new RegExp('' + q + q, 'g'), q);
        }
        else {

          // We found a non-quoted value.
          matchedValue = matches[3];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        parsed[parsed.length - 1].push(matchedValue.trim());

        // Try it again
        matches = pattern.exec(csv);
      }

      // Check that we found some data
      if (parsed.length <= 1 || !parsed[0].length) {
        throw new Error('Unable to parse any data from the CSV string provided.');
      }

      // Put together with properties from first row
      headers = parsed.shift();
      parsed = _.map(parsed, function(p) {
        var n = {};

        _.each(headers, function(h, hi) {
          n[h] = p[hi];
        });

        return n;
      });

      return parsed;
    },

    // Escape special regex character
    regexEscape: function(input) {
      return input.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    },

    // Create identifier (slug)
    makeIdentifier: function(input) {
      return input.toLowerCase().trim().replace(/[^\w ]+/g, '').replace(/ +/g, '-');
    },

    // Scroll to an element.
    scrollTo: function(selector, duration) {
      duration = duration || 500;
      var el = this.getElement(selector);

      if (!el) {
        return;
      }

      var scroller = document.body;
      var start = scroller.scrollTop;
      var to = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - 30);
      var change = to - start;
      var currentTime = 0;
      var increment = 1000  / 25;

      // Create animation funciton
      var animateScroll = function() {
        currentTime += increment;
        scroller.scrollTop = start + (Math.min(1, (currentTime / duration)) * change);

        if (currentTime < duration) {
          setTimeout(animateScroll, increment);
        }
      };

      animateScroll();
    },

    // Make an unique (across timelines) ID.  The underscore uniqueId
    // function uses a global counter which can be a problem if the order
    // of rendering is not consistent.
    uniqueId: function(prefix) {
      idCounts[prefix] = (!_.isUndefined(idCounts[prefix])) ? idCounts[prefix] + 1 : 0;
      return prefix + '-' + idCounts[prefix];
    },

    // Wrapper to handle a warning.  JS doesn't really have warnings,
    // but we output to the console so that users may be able to find it.
    warn: function(output) {
      if (console && console.warn) {
        console.warn(output);
      }
      else if (console && console.log) {
        console.log(output);
      }

      return;
    }
  });

  return Timeline;
});
