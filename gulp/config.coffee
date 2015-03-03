dest = "./bundle"
src = "./src"

fs = require "fs"
argv = require("minimist")(process.argv.slice(2))

list = fs.readdirSync "#{__dirname}/../src/entries"

multipleBundles = []
list.map (file, i, arr) ->
  _file = file.split(".")
  _file[_file.length - 1] = "js"

  this.push {
    dest: dest
    entries: "#{src}/entries/#{file}"
    outputName: _file.join(".")
  }
, multipleBundles

module.exports =
  scripts:
    src : "#{src}/vendor/**"
    dest: "#{dest}/vendor"

  less:
    src : "#{src}/styles/styles.less"
    dest: "#{dest}/styles"
    dir: "#{src}/styles/**/*"

  images:
    src : "#{src}/images/**/*"
    dest: "#{dest}/images"

  browserify:
    # enable full-paths
    fullPaths: no
    # // Enable source maps
    debug: if !argv.release then yes else no
    # // Additional file extentions to make optional
    extensions: [".coffee", ".cjsx", ".jsx", ".js"]
    # // A separate bundle will be generated for each
    # // bundle config in the list below
    bundleConfigs: multipleBundles
