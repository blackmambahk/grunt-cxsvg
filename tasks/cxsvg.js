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

  /**
   * Process the next file
   * @param {Array} stack
   * @param {object}options
   * @param {fs.WriteStream }[stream]
   */
  function next(stack, options, stream){
    if(!stream) {
      //log start info
      logger.log('processing '+(stack.length-1)+' files');
      //create stream and write header
      stream = FS.createWriteStream(options.outputFile);

      stream.write('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs>');
    }

    var file = stack.shift();
    if(file){
      if(file===options.outputFile){
        //skip the output file
        next(stack, options, stream);
      }else {
        try {
          svgo.optimize(grunt.file.read(options.dir+file), function (result) {
            logger.log('write '+file);
            stream.write('<!--[' + (file.replace('.svg', '')) + ']-->'+result.data);
            next(stack, options, stream);
          });
        } catch (e) {
          //log error and continue
          logger.error(e);
          next(stack, options, stream);
        }
      }
    }else{
      //write footer
      stream.end('</defs></svg>');
      //complete
      logger.log('all done');
    }
  }

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('cxsvg', 'The best Grunt plugin ever.', function() {
    //load options
    var options = this.options({dir: 'assets/svg/', outputFile: 'wjicons.svg'});
    //get file list from glob and start processing
    next(grunt.file.expand({cwd : options.dir}, '*.svg'), options);
  });

};
