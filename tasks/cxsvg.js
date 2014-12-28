/*
 * grunt-cxsvg
 * https://github.com/blackmambahk/grunt-cxsvg
 *
 * Copyright (c) 2014 robert.edgar
 * Licensed under the MIT license.
 */

'use strict';

//imports
var FS = require('fs');
var SVGO = require('svgo');

module.exports = function(grunt) {

  var svgo = new SVGO();

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('cxsvg', 'The best Grunt plugin ever.', function() {
    var logger = {
      warn: function() {
        grunt.log.warn.apply(null, arguments);
      },
      error: function() {
        grunt.warn.apply(null, arguments);
      },
      log: function() {
        grunt.log.writeln.apply(null, arguments);
      },
      verbose: function() {
        grunt.verbose.writeln.apply(null, arguments);
      }
    };
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({dir: 'assets/svg', outputFile: 'wjicons.svg'});

    logger.log(options.dir);

    var stack = grunt.file.expand({cwd : options.dir}, '*.svg');

    var stream = FS.createWriteStream(options.outputFile);

    function next(){
      var file = stack.shift();
      if(file){
        if(file===options.outputFile){
          next();
        }else {
          try {
            stream.write('<!--[' + (file.replace('.svg', '')) + ']-->');
            svgo.optimize(grunt.file.read(file), function (result) {
              stream.write(result.data);
              next();
            });
          } catch (e) {
            next();
          }
        }
      }else{
        stream.end('</defs></svg>');
      }
    }

    stream.once('open', function () {
      stream.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>');
      next();
    });
  });

};
