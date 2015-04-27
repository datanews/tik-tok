# mobile-timeline

A timeline focused on a mobile-first strategy (i.e. vertical)

## Development and contributing

Instructions on how to do development and make contributions to the project.

### Environment

#### Code style and quality

Use the following to get your development environment setup.  Having consistent code style leads to smoother contributions, easier reviewing, and better and more stable code.

1. Install an [Editorconfig plugin for your favorite code editor](http://editorconfig.org/#download).
    * [Editorconfig](http://editorconfig.org/) helps to standardize editor settings like indent spacing.
1. (optinal) Install a [JSCS plugin for your favorite code editor](http://jscs.info/overview.html).
    * [JSCS](http://jscs.info/) is a JS code style enforcer.
    * This is optional since the main build task will run this.
1. (optional) Install a [JSHint plugin for your favorite code editor](http://jshint.com/install/)
    * [JSHint](http://jshint.com/) is a JS error detecion tool.
    * This is optional since the main build task will run this.

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
1. Get the code (replace with your fork's repository URL) and enter into the code directory: `git clone https://github.com/datanews/mobile-timeline.git && cd mobile-timeline`
1. Install Node dependencies: `npm install`
1. Install Bower dependencies: `bower install`

### Development

Edit files in the `src` directory; these need to get built into the `dist`.  Use these handy Gulp tasks to ease in development:

* `gulp server`
    * Runs (and opens) a basic, local web server at port `8089`.
    * Automatically builds the source files when they are changes.
    * Runs [Livereload](http://livereload.com/) and will update the browser when changes are made.  Requires installation of the Livereload application or the browser extensions.
* `gulp watch`
    * Running tasks that automatically builds the source files when they are changes.

### Build

After edits are made, run checks and create build version with the following command:

    gulp

### Release

(TODO)
