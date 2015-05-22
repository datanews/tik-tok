/**
 * mobile-timeline - A timeline focused on a mobile-first strategy (i.e. vertical)
 * @version v0.0.1
 * @link https://github.com/datanews/mobile-timeline
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
    root.Timeline = factory(root._, root.moment);
  }
})(typeof window !== 'undefined' ? window : this, function(_, moment) {
  // Check depdencies
  if (typeof _ === 'undefined') {
    throw new Error('Underscore is a necessary dependency of Timeline.');
  }

  if (typeof moment === 'undefined') {
    throw new Error('Moment is a necessary dependency of Timeline.');
  }

  // Default options
  var defaultOptions = {
    // Date formates used by moment
    dateFormats: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD'],

    // Date display format
    displayFormat: 'MMM DD, YYYY',

    // Put order of events in descending order (newest to oldest).  The default
    // is off, ascending (oldest to newest)
    descending: false,

    // Template.  This can be a function or string and the default will
    // be replace in the build process
    template: '<div class="timeline-container timeline-bg-color">  <% if (typeof title !== \'undefined\' && title) { %>  <div class="timeline-header header-color cf">  <div class="timeline-label">Timeline:</div>   <div class="timeline-title"><%= title %></div>  </div>  <% } %>   <div class="spine-background">  <div class="spine-color spine"></div>  </div>   <div class="spine-end spine-top header-color">  <div><div class="spine-color spine-point"></div></div>  <div><div class="spine-color spine"></div></div>  </div>   <div class="group-container">  <% _.forEach(groups, function(g, gi) { %>  <div class="group">  <div class="group-label-container">  <div class="group-label spine-color">  <%= g.display %>  </div>  </div>   <div class="group-events">  <% _.forEach(g.events, function(e, ei) { %>  <div class="event">  <div class="event-date"><%= e.dateFormatted %></div>   <% if (e.title) { %>  <h3 class="event-title"><%= e.title %></h3>  <% } %>   <div class="event-content-container cf">  <% if (e.media) { %>  <div class="event-media-container <% if (e.body) { %>with-body<% } %>">  <div class="event-media <% if (e.source) { %>with-source<% } %>">  <% if (e.mediaType === \'youtube\') { %>  <iframe class="event-media-youtube" width="100%" height="350" src="<%= e.media %>" frameborder="0" allowfullscreen></iframe>   <% } else if (e.mediaType === \'soundcloud_large\') { %>  <iframe class="event-media-soundcloud" width="100%" height="350" scrolling="no" frameborder="no" src="<%= e.media %>"></iframe>   <% } else if (e.mediaType === \'soundcloud\') { %>  <iframe class="event-media-soundcloud" width="100%" height="166" scrolling="no" frameborder="no" src="<%= e.media %>"></iframe>   <% } else { %>  <img class="event-media-image" src="<%= e.media %>">  <% } %>  </div>   <% if (e.source) { %>  <div class="event-source">  <%= e.source %>  </div>  <% } %>  </div>  <% } %>   <% if (e.body) { %>  <div class="event-body-container <% if (e.media) { %>with-media<% } %>">  <div class="event-body"><%= e.body %></div>  </div>  <% } %>  </div>  </div>  <% }) %>  </div>  </div>  <% }) %>  </div>   <div class="spine-end spine-bottom timeline-bg-color">  <div><div class="spine-color spine-point"></div></div>  </div> </div> '
  };

  // Constructior
  var Timeline = function(options) {
    this.options = _.extend({}, defaultOptions, options || {});

    // Enusre there is data
    if (!_.isArray(this.options.events)) {
      throw new Error('"events" data was not provided as an array.');
    }

    // Ensure column mapping is an object
    if (this.options.keyMapping && !_.isObject(this.options.keyMapping)) {
      throw new Error('"keyMapping" was not provided as an object.');
    }

    // Ensure there is a template
    if (!_.isString(this.options.template) && !_.isFunction(this.options.template)) {
      throw new Error('"template" was not provided as a string or function.');
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

    // Map columns and attach events to object for easier access.
    // Should be in format { needed: provided }
    this.events = this.mapKeys(this.options.events, this.options.keyMapping);

    // Parse events like dates
    this.events = this.parseEvents(this.events);

    // Group events.
    this.groups = this.groupEvents(this.events);

    // Sort groups
    this.groups = this.sortGroups(this.groups, this.options.descending);

    // Render if browser
    if (this.isBrowser) {
      this.render();
    }
  };

  // Add methods
  _.extend(Timeline.prototype, {
    // Main renderer
    render: function() {
      this.el.innerHTML = this.options.template({
        _: _,
        groups: this.groups,
        title: this.options.title,
        timeline: this
      });
    },

    // Get element from some sort of selector or element.  Inspiration
    // from Ractive
    getElement: function(input) {
      var output;

      // Check if we are in a brower
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

    // Sort groups (and events in groups).  Sorts ascending (oldest to newest)
    // by default, but can do descending.
    sortGroups: function(groups, descending) {
      descending = descending || false;

      // Sort events
      groups = _.map(groups, function(g) {
        g.events = _.sortBy(g.events, function(e) {
          return e.date.unix() * ((descending) ? -1 : 1);
        });

        return g;
      });

      // Sort groups
      return _.sortBy(groups, function(g) {
        return g.date.unix() * ((descending) ? -1 : 1);
      });
    },

    // Group events based on grouping function.  A grouping function
    // should take an event and return an object with the following
    // properties: `id`, `date`, `display` (as moment object)
    groupEvents: function(events) {
      var groups = {};
      var groupByFunc;

      // Determine group
      this.groupType = this.determineGroups(this.events);

      // Get grouping function
      groupByFunc = 'groupBy' + this.groupType.charAt(0).toUpperCase() +
        this.groupType.slice(1);
      groupByFunc = this[groupByFunc];

      // Go through each event and create or add to group
      _.each(events, function(e) {
        var g = _.bind(groupByFunc, this)(e, moment);

        if (groups[g.id]) {
          groups[g.id].events.push(e);
        }
        else {
          groups[g.id] = g;
          groups[g.id].events = [e];
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
    determineGroups: function(events) {
      // Some functions
      var getDate = function(e) { return e.date.unix(); };

      // Determine span and grouping
      var min = _.min(events, getDate);
      var max = _.max(events, getDate);
      var diff = max.date.diff(min.date, 'years');

      return (diff < 2) ? 'months' :
        (diff < 10) ? 'years' : 'decades';
    },

    // Parse events
    parseEvents: function(events) {
      return _.map(events, _.bind(function(e) {
        // Parse date
        var d = moment(e.date, this.options.dateFormats);
        if (!d.isValid()) {
          throw new Error('Error parsing date from "' + e.date + '"');
        }

        e.date = d;

        // Determine type of media from media url if mediaType has not
        // been provided
        e.mediaType = e.mediaType || this.determineMediaType(e.media);

        // Create a formatted version of date for template
        e.dateFormatted = d.format(this.options.displayFormat);

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

    // Map columns
    mapKeys: function(events, mapping) {
      mapping = mapping || {};

      // Go through each event, clone, change mappings, and remove old
      return _.map(events, function(e) {
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
    }
  });

  return Timeline;
});
