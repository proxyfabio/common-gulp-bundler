var gulp = require("gulp");
var config = require("../config");

gulp.task("watch", ["setWatch", "build"], function() {
  gulp.watch(config.less.dir, ["less"]);
  gulp.watch(config.images.src, ["images"]);
});