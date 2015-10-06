/**
 * tik-tok - Tik Tok is a Javascript tool to easily create beautiful, simple, mobile-friendly, vertical timelines.
 * @version v0.1.1
 * @link https://github.com/datanews/tik-tok
 * @license MIT
 */
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
    root.TikTok = factory(root._, root.moment);
  }
})(typeof window !== 'undefined' ? window : this, function(_, moment) {
  // Check depdencies
  if (typeof _ === 'undefined') {
    throw new Error('Underscore is a necessary dependency of TikTok: http://underscorejs.org/');
  }

  if (typeof moment === 'undefined') {
    throw new Error('Moment is a necessary dependency of TikTok: http://momentjs.com/');
  }

  // Place to hold ID generation counts
  var idCounts = {};

  // Default options
  var defaultOptions = {
    // Date formats used by moment
    dateFormat: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD', 'YYYY-MM-DD HH:mm:ss'],

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
    template: '<div class="tik-tok-container tt-bg-color">  <div class="tt-progress-bar">  <div class="tt-progress"></div>  </div>   <% if (typeof title !== \'undefined\' && title) { %>  <div class="tt-header tt-header-color cf">  <div class="tt-label">Timeline:</div>   <div class="tt-title"><%= title %></div>  </div>  <% } %>   <div class="tt-spine-background">  <div class="tt-spine tt-spine-color"></div>  </div>   <div class="tt-spine-end tt-spine-top tt-header-color">  <div><div class="tt-spine-point tt-spine-color"></div></div>  <div><div class="tt-spine tt-spine-color"></div></div>  </div>   <div class="tt-groups">  <% _.forEach(groups, function(g, gi) { %>  <div class="tt-group">  <div class="tt-group-label-wrapper">  <div class="tt-group-label tt-spine-color">  <%= g.display %>  </div>  </div>   <div class="tt-entries">  <% _.forEach(g.entries, function(e, ei) { %>  <div class="tt-entry" id="<%= tiktok.id %>-<%= e.id %>">  <!-- Need to re-think the link field  <a class="tt-entry-link" href="#<%= tiktok.id %>-<%= e.id %>">link</a>  -->   <div class="tt-entry-date"><%= e.dateFormatted %></div>   <% if (e.title) { %>  <h3 class="tt-entry-title"><%= e.title %></h3>  <% } %>   <div class="tt-entry-content-wrapper cf">  <% if (e.media) { %>  <div class="tt-entry-media-wrapper <% if (e.body) { %>with-body<% } %>">  <div class="tt-entry-media <% if (e.source) { %>with-source<% } %>">  <% if (e.type === \'youtube\') { %>  <iframe class="tt-entry-media-youtube" width="100%" height="350" src="<%= e.media %>" frameborder="0" allowfullscreen></iframe>   <% } else if (e.type === \'soundcloud_large\') { %>  <iframe class="tt-entry-media-soundcloud" width="100%" height="350" scrolling="no" frameborder="no" src="<%= e.media %>"></iframe>   <% } else if (e.type === \'soundcloud\') { %>  <iframe class="tt-entry-media-soundcloud" width="100%" height="166" scrolling="no" frameborder="no" src="<%= e.media %>"></iframe>   <% } else if (e.type === \'embed\') { %>  <iframe class="tt-entry-media-embed" width="100%" height="350" scrolling="no" frameborder="no" src="<%= e.media %>"></iframe>   <% } else { %>  <img class="tt-entry-media-image" src="<%= e.media %>">  <% } %>  </div>   <% if (e.source) { %>  <div class="tt-entry-source">  <%= e.source %>  </div>  <% } %>  </div>  <% } %>   <% if (e.body) { %>  <div class="tt-entry-body-wrapper <% if (e.media) { %>with-media<% } %>">  <div class="tt-entry-body"><%= e.body %></div>  </div>  <% } %>  </div>  </div>  <% }) %>  </div>  </div>  <% }) %>  </div>   <div class="tt-spine-end tt-spine-bottom tt-bg-color">  <div><div class="tt-spine-point tt-spine-color"></div></div>  </div> </div> '
  };

  // Constructor.  This just calls the update function.
  var TikTok = function(options) {
    this.update(options);
  };

  // Add methods and properties
  _.extend(TikTok.prototype, {
    // What group types are valid; this should correspond with the
    // relevant functions.
    validGroupByTypes: ['months', 'years', 'decade'],

    // Anchors and otherwise checking for things at the top of
    // the page is not accurate to where people are looking, as they
    // are usually looking/reading more in the middle.  This should
    // probably be variable based on screen height.
    viewOffset: 40,

    // Builds or rebuilds the timeline
    update: function(options) {
      this.options = this.options || {};
      this.options = _.extend({}, defaultOptions, this.options, options || {});

      // Validate, build, and render
      this.validate();
      this.build();
      this.render();
    },

    // Add entries to existing entries.
    add: function(entries, options) {
      var combined;

      // Ensure our options are put together.  This should be run
      // after an initial update, but just to make sure.
      this.options = this.options || {};
      this.options = _.extend({}, defaultOptions, this.options, options || {});

      // Check to see if input is a string and process with CSV
      if (_.isString(entries)) {
        entries = this.parseCSV(entries, this.options.csvDelimiter, this.options.csvQuote);
      }

      // If entries is just an object, not array, make into an array
      entries = (_.isObject(entries) && !_.isArray(entries)) ? [entries] : entries;

      // Make sure we have an array
      if (!_.isArray(entries) || entries.length <= 0) {
        throw new Error('"entries" provided could not be made into an array.');
      }

      // It's easier to just use the existing entries that have been parsed
      // then trying to re-check the original entry options passed in
      if (this.entries && this.entries.length > 0) {
        combined = _.map(this.entries, _.clone);

        _.each(entries, function(e) {
          combined.push(e);
        });
      }
      else {
        combined = entries;
      }

      // Set as option
      this.options.entries = combined;

      // Update
      this.update();
    },

    // Validate options and other input
    validate: function() {
      // Check entry data
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

      // Ensure groupBy is valid
      if (!_.isUndefined(this.options.groupBy) &&
        this.validGroupByTypes.indexOf(this.options.groupBy) === -1) {
        throw new Error('"groupBy" was provided but not a valid value.');
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
    },

    // Build entries and process options
    build: function() {
      // Get element
      this.el = this.getElement(this.options.el);

      // Check that an element was found if in browser
      if (this.isBrowser && !this.el) {
        throw new Error('Could not find a valid element from the given "el" option.');
      }

      // If the entry data was provided as a string, attempt to parse as
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

      // Sort entries.  The entries as a single array is
      // used for easy access too all entries
      this.entries = this.sortEntries(this.entries, this.options.descending);

      // Group entries.
      this.groups = this.groupEntries(this.entries);

      // Sort groups
      this.groups = this.sortGroups(this.groups, this.options.descending);

      // If browser, do some DOM things and render
      if (this.isBrowser) {
        // Get the id from the element or create an id for the timeline
        // as there may be multiple timelines on the same page
        this.id = this.el.id || this.uniqueId('tik-tok-timeline');
        this.el.id = this.id;
      }
    },

    // Main renderer
    render: function() {
      var _this = this;

      // If not in browser, no need to do DOM things
      if (!this.isBrowser) {
        return;
      }

      // Run template function with values
      this.el.innerHTML = this.options.template({
        _: _,
        groups: this.groups,
        title: this.options.title,
        tiktok: this
      });

      // Go to specific entry, check if part of this timeline.  This check
      // is not perfect
      if (window.location.hash && window.location.hash.indexOf('#' + this.id) === 0) {
        this.scrollTo(window.location.hash);
      }

      // Add entries to scroll to specific entry when link is
      // clicked.  This is a bit nicer and consistent with load.
      // Make a reference-able function first.  Note that we
      // need the element this.
      this.eventSmoothAnchor = this.eventSmoothAnchor || function(e) {
        e.preventDefault();
        var hash = this.getAttribute('href');
        history.pushState(null, null, hash);
        _this.scrollTo(hash);
      };

      // Attach events
      _.each(this.el.querySelectorAll('a.tt-entry-link'), _.bind(function(a) {
        a.removeEventListener('click', this.eventSmoothAnchor);
        a.addEventListener('click', this.eventSmoothAnchor);
      }, this));

      // Gather placement of entries and timeline in order to determine
      // where the user is on the timeline
      this.determinePlacements();

      // Get mini timeline elements
      this.barEl = this.getElement('#' + this.id + ' .tt-progress-bar');
      this.progressEl = this.getElement('#' + this.id + ' .tt-progress');

      // Make a throttled determinePlacements (see updateProgress)
      this.determinePlacementsThrottled = _.throttle(_.bind(function() {
        this.determinePlacements();
      }, this), 200);

      // Watch scrolling to update progress bar.  Make reference-able function
      // for removal
      this.eventUpdateProgress = this.eventUpdateProgress || _.bind(this.updateProgress, this);
      document.removeEventListener('scroll', this.eventUpdateProgress);
      document.addEventListener('scroll', this.eventUpdateProgress);
    },

    // Update progress bar
    updateProgress: function() {
      var currentViewTop = document.body.scrollTop;
      var currentViewHeight = window.innerHeight;
      var currentViewBottom = currentViewTop + currentViewHeight;
      var currentEntry = 0;

      // Offset view.  Adjust just a bit so that when scrolling to
      // a specific entry, the progress will udpate.
      var o = this.viewOffset + 2;

      // This is a bit hackish, but helps with a few situations like on
      // any movements of the elements through image loading or window
      // resize.  Use throttle verstion
      this.determinePlacementsThrottled();

      // Determine if in timeline at all
      if (currentViewTop >= this.top - o && currentViewTop <= this.bottom - o) {
        this.barEl.classList.add('enabled');

        // Determine which entry we are in
        _.each(this.entries, _.bind(function(e, ei) {
          var bottom = (this.entries[ei + 1]) ? this.entries[ei + 1].top :
            this.bottom;

          if (currentViewTop >= e.top - o && currentViewTop < bottom - o) {
            currentEntry = ei;
          }
        }, this));

        // If we reach the end of the page and we are still on a timeline, we
        // assume the end of the timeline
        if (currentViewBottom >= this.documentHeight - 5) {
          currentEntry = this.entries.length - 1;
        }

        // Move progress accordingly.
        this.progressEl.style.width = (currentEntry / (this.entries.length - 1) * 100) + '%';
      }
      else {
        this.barEl.classList.remove('enabled');
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
      return !!(typeof window !== 'undefined' && document);
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

    // Sort entries.  Sorts ascending (oldest to newest)
    // by default, but can do descending.
    sortEntries: function(entries, descending) {
      descending = descending || false;

      // Sort entries
      return _.sortBy(entries, function(e) {
        return e.date.unix() * ((descending) ? -1 : 1);
      });
    },

    // Group entries based on grouping function.  A grouping function
    // should take an entry and return an object with the following
    // properties: `id`, `date`  (as moment object), `display`
    groupEntries: function(entries) {
      var groups = {};
      var groupByFunc;

      // Determine group.  Allow this to be overriden with option.
      this.groupType = (this.options.groupBy &&
        this.validGroupByTypes.indexOf(this.options.groupBy) !== -1) ?
        this.options.groupBy : this.determineGroups(this.entries);

      // Get grouping function
      groupByFunc = 'groupBy' + this.groupType.charAt(0).toUpperCase() +
        this.groupType.slice(1);
      groupByFunc = this[groupByFunc];

      // Go through each entry and create or add to group
      _.each(entries, _.bind(function(e) {
        var g = _.bind(groupByFunc, this)(e, moment, this.options.groupByDisplay);

        if (groups[g.id]) {
          groups[g.id].entries.push(e);
        }
        else {
          groups[g.id] = g;
          groups[g.id].entries = [e];
        }
      }, this));

      return _.values(groups);
    },

    // Group by for hours
    groupByHours: function(entry, moment, groupByDisplay) {
      return {
        id: entry.date.format('YYYY-MM-DD-HH'),
        date: moment(entry.date.format('YYYY-MM-DD-HH'), 'YYYY-MM-DD-HH'),
        display: moment(entry.date.format('YYYY-MM-DD-HH'), 'YYYY-MM-DD-HH')
          .format((groupByDisplay) ? groupByDisplay : 'h a')
      };
    },

    // Group by for days
    groupByDays: function(entry, moment, groupByDisplay) {
      return {
        id: entry.date.format('YYYY-MM-DD'),
        date: moment(entry.date.format('YYYY-MM-DD'), 'YYYY-MM-DD'),
        display: moment(entry.date.format('YYYY-MM-DD'), 'YYYY-MM-DD')
          .format((groupByDisplay) ? groupByDisplay : 'dddd')
      };
    },

    // Group by for months
    groupByMonths: function(entry, moment, groupByDisplay) {
      return {
        id: entry.date.format('YYYY-MM'),
        date: moment(entry.date.format('YYYY-MM'), 'YYYY-MM'),
        display: moment(entry.date.format('YYYY-MM'), 'YYYY-MM')
          .format((groupByDisplay) ? groupByDisplay : 'MMM YYYY')
      };
    },

    // Group by for years
    groupByYears: function(entry, moment, groupByDisplay) {
      return {
        id: entry.date.format('YYYY'),
        date: moment(entry.date.format('YYYY'), 'YYYY'),
        display: moment(entry.date.format('YYYY'), 'YYYY')
          .format((groupByDisplay) ? groupByDisplay : 'YYYY')
      };
    },

    // Group by for decades
    groupByDecades: function(entry, moment, groupByDisplay) {
      var decade = Math.floor(entry.date.year() / 10) * 10;
      return {
        id: decade.toString(),
        date: moment(decade.toString(), 'YYYY'),
        display: moment(decade.toString(), 'YYYY')
          .format((groupByDisplay) ? groupByDisplay : 'YYYY[\'s]')
      };
    },

    // Determine groups
    determineGroups: function(entries) {
      // Some functions
      var getDate = function(e) { return e.date.unix(); };

      // Determine span and grouping
      var min = _.min(entries, getDate);
      var max = _.max(entries, getDate);
      var years = max.date.diff(min.date, 'years');
      var days = max.date.diff(min.date, 'days');

      // These breaks are an attempt to be a sane default
      // but there's not really a way to make this perfect for
      // everyone, hence why it can be overriden
      return (days <= 1) ? 'hours' :
        (days <= 7) ? 'days' :
        (years < 2) ? 'months' :
        (years < 20) ? 'years' :
        'decades';
    },

    // Parse and sort entries
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
        e.type = e.type || this.determineMediaType(e.media);

        // Create a formatted version of date for template, use the global
        // options is one is not provided for the entry.
        e.dateFormatted = d.format(e.dateDisplay || this.options.dateDisplay);

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

      // General embed/iframe
      else if (url.indexOf('embed') !== -1 || url.indexOf('iframe') !== -1) {
        return 'embed';
      }

      // Image
      else {
        return 'image';
      }
    },

    // For each entry, determine where it is on the page
    // so that we can know where the user is in the timeline.
    //
    // Top and bottom of elements can be inaccurate as items,
    // like images may not be loaded yet.
    determinePlacements: function() {
      var _this = this;
      var body = document.body;
      var html = document.documentElement;

      // Determine top and bottom of timeline
      this.top = this.el.getBoundingClientRect().top + window.pageYOffset;
      this.bottom = this.el.getBoundingClientRect().bottom + window.pageYOffset;

      // Get the full window height
      this.documentHeight = Math.max(body.scrollHeight, body.offsetHeight,
        html.clientHeight, html.scrollHeight, html.offsetHeight);

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

      // Go through each entry, clone, change mappings, and remove old
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
      var to = Math.max(0, el.getBoundingClientRect().top + window.pageYOffset - this.viewOffset);
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

  return TikTok;
});
