var gulp = require("gulp");
var path = require("path");
var config = require("../config").less;
var $ = require("gulp-load-plugins")({
  rename: {
    "gulp-minify-css": "cssmin"
  }
});

gulp.task("less", function() {
  return gulp.src(config.src)
    .pipe($.changed(config.dest))
    .pipe($.less({
      paths: [path.join(__dirname, "less", "includes")]
    }))
    .pipe($.cssmin({
      processImport: true
    }))
    .pipe(gulp.dest(config.dest));
});