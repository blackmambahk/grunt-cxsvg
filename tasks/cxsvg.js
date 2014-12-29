/*
 * grunt-cxsvg
 * https://github.com/blackmambahk/grunt-cxsvg
 *
 * Copyright (c) 2014 robert.edgar
 * Licensed under the MIT license.
 * Optimize individual svg files and generate a single svg container file with embedded symbols
 */

'use strict';

//imports
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
  var rxEnableBg = /enable-background="[^"]*"/g;
  var rxStripGrid = /<g[^>]*>(.*)?<\/g>/g;
  var rxStripSize = / (height|width|x|y)="[^"]*"/g;

  /**
   * Helper function to map svg file names to view 'pod' containing a "use" tag
   * @param {string} name svg filename including extension
   * @returns {string}
   */
  function useMapHelper(name) {
    return '<div class="pod"><svg><use xlink:href="#' + name.replace('\.svg','') + '" /></svg><div class="title">'+name.replace('\.svg','') +'</div></div>';
  }


  /**
   * Process the next file
   * @param {Array} stack
   * @param {object}options
   */
  function next(stack, options){
    if(!options.useinfo) {
      //log start info
      logger.log('processing '+(stack.length-1)+' files');
      //store useinfo
      options.useinfo = stack.map(useMapHelper).join('');
      //write svg header
      options.svginfo = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    }

    var file = stack.shift();
    if(file){
      if(file===options.outputFile){
        //skip the output file
        next(stack, options);
      }else {
        try {
          svgo.optimize(grunt.file.read(options.dir+file), function (result) {
            logger.log('write '+file);
            var svg = result.data.replace('<svg ', '<symbol id="'+(file.replace('.svg', ''))+'"').replace('<\/svg>','<\/symbol>').replace('xmlns="http://www.w3.org/2000/svg"','').replace(rxEnableBg,'').replace(rxStripSize,'').replace(rxStripGrid,'');
            options.svginfo+=svg;
            next(stack, options);
          });
        } catch (e) {
          //log error and continue
          logger.error(e);
          next(stack, options);
        }
      }
    }else{
      //write svg tail
      options.svginfo+='</svg>';
      //write main output svg file
      grunt.file.write(options.dir+options.outputFile, options.svginfo);
      //write html view page
      grunt.file.write(options.dir+'icons.html', '<!doctype html><html><head><style>.pod{float:left;width:100px;height:100px;text-align:center;border: 1px solid #666;margin: 5px;padding: 5px;}svg{width:50px;height:50px;fill:black !important;}</style><head><body>'+options.svginfo+options.useinfo+'</body></html>');
      //complete
      logger.log('all done');
    }
  }

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('cxsvg', 'The cx svg optimizer plugin.', function() {
    //load options
    var options = this.options({dir: 'assets/svg/', outputFile: 'wjicons.svg'});
    //get file list from glob and start processing
    next(grunt.file.expand({cwd : options.dir}, '*.svg'), options);
  });

};
