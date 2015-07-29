/* global hljs:false, Egg:false, $:false */

/**
 * JS specific to the examples.
 */
 'use strict';

(function() {
  // Get example HTML output
  var html = $('<div>').append($('.example-html').clone()).html()
    .replace(/\s+\n/gi, '\n')
    .replace(/^    /gm, '');
  $('.example-html-output pre code').text(html);

  // Need to do things when all is ready
  $(document).ready(function() {
    // Get example JS output
    var js = $('#example-javascript').html();
    if (js && js.trim && js.trim()) {
      js = js.trim().replace(/\s+\n/gi, '\n').replace(/^      /gm, '');
      $('.example-javascript-output').show();
      $('.example-javascript-output pre code').text(js);
    }

    // Get example CSS output
    var css = $('#example-css').html();
    if (css && css.trim && css.trim()) {
      css = css.trim().replace(/\s+\n/gi, '\n').replace(/^      /gm, '');
      $('.example-css-output').show();
      $('.example-css-output pre code').text(css);
    }

    // Load highlightJS
    hljs.initHighlightingOnLoad();
  });

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
