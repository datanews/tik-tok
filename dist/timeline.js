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
    dateFormats: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD']
  };

  // Constructior
  var Timeline = function(options) {
    var _this = this;
    this.options = _.extend({}, defaultOptions, options || {});

    // Enusre there is data
    if (!_.isArray(this.options.events)) {
      throw new Error('"events" data was not provided as an array.');
    }

    // Ensure there is column mapping
    if (this.options.columnMapping && !_.isObject(this.options.columnMapping)) {
      throw new Error('"columnMapping" was not provided as an object.');
    }

    // Map columns and attach events to object for easier access.
    // Should be in format { needed: provided }
    this.events = this.mapColumns(this.options.events, this.options.columnMapping);

    // Parse out dates
    this.events = _.map(this.events, function(e) {
      var d = moment(e.date, _this.options.dateFormats);

      if (!d.isValid()) {
        throw new Error('Error parsing date from "' + e.date + '"');
      }

      e.date = d;
      return e;
    });

    // Determine groups
    this.groupType = this.determineGroups(this.events);
  };

  // Add methods
  _.extend(Timeline.prototype, {
    // Main renderer
    render: function() {
      console.log(this);
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
