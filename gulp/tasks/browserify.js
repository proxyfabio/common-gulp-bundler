"use_strict";
/* browserify task
   ---------------
   Bundle javascripty things with browserify!
   This task is set up to generate multiple separate bundles, from
   different sources, and to use Watchify when run from the default task.
   See browserify.bundleConfigs in gulp/config.js
*/

var bundleLogger = require("../util/bundleLogger");
var handleErrors = require("../util/handleErrors");
var config = require("../config").browserify;
var browserify = require("browserify");
var watchify = require("watchify");
var gulp = require("gulp");
var plugins = require("gulp-load-plugins")();
var buffer = require("vinyl-buffer");
var source = require("vinyl-source-stream");

gulp.task("browserify", function(callback) {
  var bundleQueue = config.bundleConfigs.length;

  var browserifyThis = function(bundleConfig) {

    var bundler = browserify({
      // Required watchify args
      cache: {},
      packageCache: {},
      fullPaths: config.fullPaths,
      // Specify the entry point of your app
      entries: bundleConfig.entries,
      // Add file extentions to make optional in your requires
      extensions: config.extensions,
      // Enable source maps!
      debug: config.debug
    });

    var reportFinished = function() {
      // Log when bundling completes
      bundleLogger.end(bundleConfig.outputName);

      if (bundleQueue) {
        bundleQueue--;
        if (bundleQueue === 0) {
          // If queue is empty, tell gulp the task is complete.
          // https://github.com/gulpjs/gulp/blob/master/docs/API.md#accept-a-callback
          callback();
        }
      }
    };

    var bundle = function() {
      // Log when bundling starts
      bundleLogger.start(bundleConfig.outputName);

      var uglifyConfig;
      if (!config.debug) {
        uglifyConfig = {
          sourceRoot: gulp.dest(bundleConfig.dest),
          outSourceMap: false,
          output: {
            beautify: false
          }
        };
      } else {
        uglifyConfig = {
          sourceRoot: gulp.dest(bundleConfig.dest),
          outSourceMap: true,
          output: {
            beautify: true
          }
        };
      }

      return bundler
        .bundle()
        .on("error", handleErrors) // Report compile errors
        .pipe(source(bundleConfig.outputName)) // Use vinyl-source-stream to make the stream gulp compatible. Specifiy the desired output filename here.
        .pipe(plugins.jshint())
        .pipe(buffer()) // <----- convert from streaming to buffered vinyl file object
        .pipe(plugins.uglifyjs(
          bundleConfig.outputName,
          uglifyConfig)) // now gulp-uglify works
        .pipe(gulp.dest(bundleConfig.dest)) // Specify the output destination
        .on("end", reportFinished);
    };

    if (global.isWatching) {
      // Wrap with watchify and rebundle on changes
      bundler = watchify(bundler);
      // Rebundle on update
      bundler.on("update", bundle);
    }

    return bundle();
  };

  // Start bundling with Browserify for each bundleConfig specified
  config.bundleConfigs.forEach(browserifyThis);
});