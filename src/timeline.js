/* global define:false */

'use strict';

// Wrap so that we can support different module loaders
(function(root, factory) {
  // AMD
  if (typeof define === 'function' && define.amd) {
    define(['underscore', 'jquery', 'exports'], function(_, $, exports) {
      // Export global even in AMD case in case this script is loaded
      // with others that may still expect a global Backbone.
      root.Timeline = factory(root, exports, _, $);
    });
  }
  else if (typeof exports !== 'undefined') {
    // Node.js or CommonJS.
    factory(root, exports, require('underscore'), require('jquery'));
  }
  else {
    // Brower global
    root.Timeline = factory(root, {}, root._, root.jQuery);
  }

})(this, function(root, Timeline, _, $) {
  // Timeline should come in as an object
  Timeline = Timeline || {};

  // Check depdencies
  if (typeof _ === 'undefined') {
    throw new Error('Underscore is a necessary dependency of Timeline.');
  }

  if (typeof $ === 'undefined') {
    throw new Error('jQuery is a necessary dependency of Timeline.');
  }

  return Timeline;
});
