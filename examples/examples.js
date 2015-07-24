/* global hljs:false, Egg:false */

/**
 * JS specific to the examples.
 */

(function() {
  'use strict';

  // Load highlightJS
  hljs.initHighlightingOnLoad();

  // Egg$ all around
  var egg = new Egg();
  var tikTok = true;
  egg.addCode([52, 52, 52], function() {
    if (tikTok) {
      document.getElementById('tik-tok-image').src = 'examples/images/tik-tok-replacement.jpg';
    }
    else {
      document.getElementById('tik-tok-image').src = 'examples/images/tik-tok-medium.png';
    }

    tikTok = !tikTok;
  }).listen();
})();
