/*!
 * Copyright (c) 2016 Matthew Harvey
 * Licensed under the MIT license.
 */
(function($, document, $document) {

  'use strict';

  var cache = {};
  var initialized = false;
  var defaultOptions = {
    urls: []
  };

  // public interface

  /**
   * Initialize the plugin, telling it to pre-emptively GET and cache the
   * <title> and <body> content of the page at each URL in the given list. It will do this
   * after the document "ready" event has been triggered. Before AJAX-requesting pages other
   * than the current one, jquery.angryLoader will arrange for the document to trigger
   * the "angryLoader:load" event.
   * @param {object} options
   * @param {string[]} options.urls The root-relative URLs of the pages to be cached.
   * @throws {Error} if this function has already been called, i.e. if jquery.angryLoader has
   *   already been initialized.
   */
  $.angryLoader = function(options) {
    options = $.extend({}, defaultOptions, options);
    if (initialized) {
      throw new Error('AngryLoader has already been initialized.');
    } else {
      initialize(options);
      initialized = true;
    }
  };

  // implementation

  function initialize(options) {
    if (historyAPISupported()) {
      $(window).on('popstate', function() {
        handleBack();
      });
      initializeLinks();
      $document.ready(function() {
        populateCache(options.urls);
      });
    } else {
      $document.ready(notifyLoaded);
    }
  }

  function initializeLinks() {
    $document.on('click', 'a', function(event) {
      var url = $(event.target).attr('href');
      if (url in cache) {
        event.preventDefault();
        load(url);
        window.history.pushState({}, undefined, url);
      }
    });
  }

  function populateCache(urls) {
    var current = currentUrl();
    var extractTitleContent = innerContentExtractor('title');
    var extractBodyContent = innerContentExtractor('body');
    if (urls.indexOf(current) !== -1) {
      save(current, $('html').html(), extractTitleContent, extractBodyContent);
    }
    notifyLoaded();
    $.each(urls, function(index, url) {
      if (url !== current) {
        $.get(url).done(function(data, textStatus/*, jqXHR */) {
          if (textStatus === 'success') {
            save(url, data, extractTitleContent, extractBodyContent);
          }
        });
      }
    });
  }

  function save(url, pageContent, extractTitleContent, extractBodyContent) {
    cache[url] = {
      title: extractTitleContent(pageContent),
      content: extractBodyContent(pageContent)
    };
  }

  function load(url) {
    var cached = cache[url];
    $document.prop('title', cached.title);
    $('body').html(cached.content);
    $('html, body').animate({ scrollTop: 0 }, 0);
    notifyLoaded();
  }

  function notifyLoaded() {
    $document.trigger('angryLoader:load');
  }

  function handleBack() {
    var url = currentUrl();
    if (url in cache) {
      load(url);
    }
  }

  function currentUrl() {
    return document.location.pathname;
  }

  function innerContentExtractor(tagName) {
    // Regexes adapted from
    // https://github.com/defunkt/jquery-pjax/blob/master/jquery.pjax.js
    // Use a closure to avoid regexes being recreated multiple times.
    var openingMatcher = '<' + tagName + '[^>]*>';
    var openingRegExp = new RegExp(openingMatcher, 'i');
    var contentMatcher = '([\\s\\S.]*)';
    var closingMatcher = '</' + tagName + '>';
    var elemRegExp = new RegExp(openingMatcher + contentMatcher + closingMatcher, 'i');

    return function(html) {
      var elem = html.match(elemRegExp)[0];
      var elemInnerStart = elem.match(openingRegExp)[0].length;
      return elem.slice(elemInnerStart, -closingMatcher.length);
    };
  }

  // feature detection

  function historyAPISupported() {
    return (
      typeof window.history !== 'undefined' &&
      typeof window.history.pushState === 'function'
    );
  }

})(jQuery, document, jQuery(document));
