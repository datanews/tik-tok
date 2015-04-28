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

    // Template.  This can be a function or string and the default will
    // be replace in the build process
    template: '<div class="timeline-container">  <% _.forEach(groups, function(g, gi) { %>  <div class="group">  <div class="group-label">  <%= g.id %>  </div>   <div class="group-events">  <% _.forEach(g.events, function(e, ei) { %>  <div class="event">  <div class="event-date"><%= e.dateFormatted %></div>  <h3 class="event-title"><%= e.title %></h3>   <p><%= e.body %></p>  </div>  <% }) %>  </div>  </div>  <% }) %> </div> '
  };

  // Constructior
  var Timeline = function(options) {
    this.options = _.extend({}, defaultOptions, options || {});

    // Enusre there is data
    if (!_.isArray(this.options.events)) {
      throw new Error('"events" data was not provided as an array.');
    }

    // Ensure column mapping is an object
    if (this.options.columnMapping && !_.isObject(this.options.columnMapping)) {
      throw new Error('"columnMapping" was not provided as an object.');
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
    this.events = this.mapColumns(this.options.events, this.options.columnMapping);

    // Parse events like dates
    this.events = this.parseEvents(this.events);

    // Group events.
    this.groups = this.groupEvents(this.events);

    // Sort groups
    this.groups = this.sortGroups(this.groups);

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

    // Sort groups (and events in groups)
    sortGroups: function(groups) {
      // Sort events
      groups = _.map(groups, function(g) {
        g.events = _.sortBy(g.events, function(e) {
          return e.date.unix();
        });

        return g;
      });

      // Sort groups
      return _.sortBy(groups, function(g) {
        return g.date.unix();
      });
    },

    // Group events based on grouping function.  A grouping function
    // should take an event and return an object with the following
    // properties: `id`, `date` (as moment object)
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
        date: moment(event.date.format('YYYY-MM'), 'YYYY-MM')
      };
    },

    // Group by for years
    groupByYears: function(event, moment) {
      return {
        id: event.date.format('YYYY'),
        date: moment(event.date.format('YYYY'), 'YYYY')
      };
    },

    // Group by for decades
    groupByDecades: function(event, moment) {
      var decade = Math.floor(event.date.year() / 10) * 10;
      return {
        id: decade.toString(),
        date: moment(decade.toString(), 'YYYY')
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

        // Create a formatted version of date for template
        e.dateFormatted = d.format(this.options.displayFormat);

        return e;
      }, this));
    },

    // Map columns
    mapColumns: function(events, mapping) {
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
