/* global hljs:false, Egg:false, $:false */

/**
 * JS specific to the examples.
 */
 'use strict';

(function() {
  // Determine path to examples
  var examplesPath = (window.location.pathname.match(/^\/examples\//gi)) ?
    './' : './examples/';

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
      $('#tik-tok-image').attr('src', examplesPath + 'images/tik-tok-replacement.jpg');
      $('.menu ul li img').attr('src', examplesPath + 'images/tik-tok-head-100-replacement.png');
    }
    else {
      $('#tik-tok-image').attr('src', examplesPath + 'images/tik-tok-medium.png');
      $('.menu ul li img').attr('src', examplesPath + 'images/tik-tok-head-right-grey-100.png');
    }

    tikTok = !tikTok;
  }).listen();
})();
