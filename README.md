# jquery.angryLoader

### Overview

Similar to [Turbolinks](http://github.com/turbolinks/turbolinks/) and
[pjax](http://github.com/defunkt/jquery-pjax/), jquery.angryLoader
enables fast navigation within your
site.  But jquery.angryLoader is impatient, and unsophisticated. Want to force a bunch
of preemptive GET requests on your users for pages they might not visit, just
so that, on the off chance they *do* visit them, they'll get to them really
fast? Then jquery.angryLoader is for you!

### Usage

Tell jquery.angryLoader the list of URLs you want to be fast, like so:

```js
  $.angryLoader({
    urls: ['/', '/blog/', '/mega/']
  });
```

When someone first visits your site, once the initially visited page has been
requested normally and the document is "ready", jquery.angryLoader caches the `<body>`
content of the current page in memory (provided its root-relative URL is among the URLs you've
listed), and then AJAX-requests HTML from each of the other URLs you've given
it, and caches their `<body>` content as well. It also caches the content of
each page's `<title>` tag. When the user clicks on any link that has one of
the exact listed URLs as its `href` attribute, the browser will grab the
cached `<body>` content for that page, swap out the current `<body>`
content with the cached content, and set the page title accordingly, without
any further HTTP request being made. Any links to URLs that not in the
whitelist, however, will be handled normally.

jquery.angryLoader uses the HTML5 history API to manage browser history so that, for
the user, it's just like they're navigating to a different page (but fast),
with browser back and forward buttons working as per usual. If HTML5 history is
not supported by the browser, however, jquery.angryLoader will degrade gracefully and
do nothing at all, the links then just acting like links normally would.

*Both* when a new page is loaded from the cache, *and* on ordinary
`$(document).ready`, the event `angryLoader:load` will be triggered by the
`document` element. Note that if the current page content has just been cached (such as
on a fresh site visit or browser reload), this event is triggered just *after* it
is cached, but *before* the AJAX requests are made for the other pages. If you're
using jquery.angryLoader the code you would normally run on `$(document).ready`
should generally be run on this event instead, i.e.:

```js
  $(document).on('angryLoader:load', function() {

    // Set up your click handlers and whatnot...

  });
```

jquery.angryLoader is probably best suited to sites with only a few pages that aren't
too big. It is probably a bad idea to make your users GET a tonne of data which
they'll probably never see.

### Installation

If you're using bower for your front-end dependency management, you can install
jquery.angryLoader and add it to your project's bower.json as follows:

```
  bower install --save jquery-angry-loader
```

Ensure jquery.angry-loader.js or jquery.angry-loader.min.js is source somewhere
in your project after jquery.js.

Alternatively, you can download and unzip the project and then build it yourself by
running the following commands within the project root:

```
  npm install
  bower install
  grunt
```

This will install the dependencies, run the tests and build two versions of
jquery.angry-loader.js within dist/, one minified and one non-minified. Ensure
one of these is sourced in your project somewhere after jquery.js.
