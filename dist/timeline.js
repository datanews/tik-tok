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
    dateFormats: ['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY'],

    // Column mapping in format { needed: provided }
    columnMapping: {
      date: 'date',
      title: 'title',
      body: 'body'
    }
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
    if (!_.isObject(this.options.columnMapping)) {
      throw new Error('"columnMapping" was not provided as an object.');
    }

    // Map columns and attach events to object for easier access
    this.events = this.mapColumns(this.options.events, this.options.columnMapping);

    // Parse out dates
    this.events = _.map(this.events, function(e) {
      e.date = moment(e.date, _this.options.dateFormats);
    });
  };

  // Add methods
  _.extend(Timeline.prototype, {
    // Main renderer
    render: function() {
      console.log(this);
    },

    // Map columns
    mapColumns: function(events, mapping) {
      // Go through each event, clone, change mappings, and remove old
      return _.map(events, function(e) {
        var n = _.clone(e);

        // Find a mapping
        _.each(mapping, function(m, mi) {
          if (!_.isUndefined(e[m])) {
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
