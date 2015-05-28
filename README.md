# mobile-timeline (DRAFT)

A timeline focused on a mobile-first strategy (i.e. vertical)

[![Testling browser support](https://ci.testling.com/datanews/mobile-timeline.png)
](https://ci.testling.com/datanews/mobile-timeline)

## Install

The easiest way to get the code is to use [Bower](https://bower.io); this will also get the **[Underscore](http://underscorejs.org/) and [Moment.js](http://momentjs.com/docs/) dependencies**.

    bower install https://github.com/datanews/mobile-timeline.git

You can also download the code from Github (TODO: include link and example).

## Include

You can manually include the files:

    <link rel="stylesheet" href="timeline/dist/timeline.css">
    <script src="timeline/dist/timeline.js"></script>

The library also supports module loaders like RequireJS, AMD, or Browserify.

## Use

Timeline is simply a object your create and give it configuration:

    var t = new Timeline({
      el: '.example-timeline-container',
      events: [ ... event data here ... ]
    });

### Events

Event data should be either an array of objects or a CSV string with the following keys or column headings respectively.  The `date` field is the only absolutely necessary field, though, you probably want at least a title.

JSON example:

    {
      date: '2014-04-01', // String date, see format option below for what is supported.
      title: 'This is an awesome event',
      body: 'This is the optional main text',
      // Media should be a URL to an image or the embed URL for Youtube, SoundCloud,
      // and (more soon)
      media: 'http://url.com/to/image.png',
      source: 'This is a source line for your media'
    }

CSV example:

    date,title,body,media,source
    2013-01-01,Great event,"Why not some <em>HTML</em>",,
    2013-01-01,Awesome event,"This has a comma, in it.",http://url.com/to/image.png,Cool image

### Options

You can use the following options when defining a timeline:

* `dateFormat`: A string or array of strings that will be used to parse dates.  The default is: `['MMM DD, YYYY', 'MM/DD/YYYY', 'M/D/YYYY', 'DD MMM YYYY', 'YYYY-MM-DD']`.  For more details see the Moment.js [parsing docs](http://momentjs.com/docs/#/parsing/string-formats/).
* `displayFormat`: The [Moment.js format](http://momentjs.com/docs/#/displaying/format/) for how the event date will be displayed.  The default is `MMM DD, YYYY`.
* `descending`: Boolean that will make the order of events descending (newest to oldest) if set to true.  The default is `false` which is ascending (oldest to newest).
* `csvDelimiter`: The delimiting chracter if you are using a CSV string.  The default is `,`.
* `csvQuote`: The quote chracter if you are using a CSV string.  The default is `"`.
* `keyMapping`: If you have event data that is keyed differently, you can provide a basic object to convert when it is processed.  For instance:  
    ```
    {
      'needed-key': 'provided-key',
      'date': 'this is our crazy keyed date field'
    }
    ```
* `template`: If you want to override the HTML output of the timeline, use your own template.  See the `src/timeline.tpl.html` for a starting point.  You can provide a string that will be processed with [Underscore's template function](http://underscorejs.org/#template), or provide your own templating function.  The function will be passed the `groups` of events, `_` (Underscore), and the whole `timeline` object.


## Development and contributing

Instructions on how to do development and make contributions to the project.

### Environment

#### Dependencies

Install dependencies.  All commands are assumed to be from the [Command Line](http://en.wikipedia.org/wiki/Command-line_interface) and from the root directory of the project (except for the initial getting of the code).

1. Install [Git](http://git-scm.com/).
    * On a Mac, install [Homebrew](http://brew.sh/) and run: `brew install git`
    * On common Linux systems: `apt-get install git-core`
1. Install [NodeJS](https://nodejs.org/) (io.js should work as well).
    * On a Mac: `brew install node`
    * On common Linux systems: `apt-get install nodejs`
1. Install [Gulp](http://gulpjs.com/) command line tool: `npm install gulp -g`
1. Install [Bower](http://bower.cio/) command line tool: `npm install bower -g`
1. (optional, see below) Install [Testling](https://ci.testling.com/) command line tool: `npm install -g testling`
1. Get the code (replace with your fork's repository URL) and enter into the code directory: `git clone https://github.com/datanews/mobile-timeline.git && cd mobile-timeline`
1. Install Node dependencies: `npm install`
1. Install Bower dependencies: `bower install`

### Development

Edit files in the `src` directory; these need to get built into the `dist` directory.  Use these handy Gulp tasks to ease in development:

* `gulp server`
    * Runs (and opens) a basic, local web server at port `8089`.
    * Automatically builds the source files when they are changes.
    * Runs [Livereload](http://livereload.com/) and will update the browser when changes are made.  Requires installation of the Livereload application or the browser extensions.
* `gulp watch`
    * Running tasks that automatically builds the source files when they are changes.

### Testing

Test should be run within the watch tasks described above, but you can run the tests manually with the following:

    gulp test

#### Cross-browser testing

The project is setup to use [Testling](https://ci.testling.com/) for basic cross-browser support.  The tests will get run when pushed up to Github.  You can run them locally if you have installed the Testling command line tool (see above) with the following:

    testling

### Build

After edits are made, run checks and create build version with the following command:

    gulp

### Release

(TODO)

#### Code style and quality

Use the following to get your development environment setup.  Having consistent code style leads to smoother contributions, easier reviewing, and better and more stable code.

1. Install an [Editorconfig plugin for your favorite code editor](http://editorconfig.org/#download).
    * [Editorconfig](http://editorconfig.org/) helps to standardize editor settings like indent spacing.
1. (optinal) Install a [JSCS plugin for your favorite code editor](http://jscs.info/overview.html).
    * [JSCS](http://jscs.info/) is a JS code style enforcer.
    * This is optional since the main build task will run this.
1. (optional) Install a [JSHint plugin for your favorite code editor](http://jshint.com/install/)
    * [JSHint](http://jshint.com/) is a JS error detection tool.
    * This is optional since the main build task will run this.
