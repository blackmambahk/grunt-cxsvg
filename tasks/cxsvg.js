/*
 * grunt-cxsvg
 * https://github.com/blackmambahk/grunt-cxsvg
 *
 * Copyright (c) 2014 Robert Edgar
 * Licensed under the MIT license.
 * Optimize individual svg files and generate a single svg container file with embedded symbols
 */

'use strict';

//imports
var SVGO = require('svgo');

module.exports = function(grunt) {
    var path = require('path');
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
    var rxEnableBgStyle = /style="enable-background:new 0 0 32 32;"/g;
    var rxXWhiteSpace =  /xml:space="preserve"/g;
    var rxStripGrid = /<g id="icomoon-ignore">(.*?)<\/g>/;
    var rxStripSize = / (height|width|x|y)="[^"]*"/g;
    var rxStripCr = /[\n\r\t]/g;
    var rxStripWhitespace = />\s+</g;
    var htmlTemplate = '<!doctype html><html><head><style>.pod{float:left;width:100px;height:100px;text-align:center;border: 1px solid #666;margin: 5px;padding: 5px;}svg{width:50px;height:50px;fill:black !important;}</style><head><body>#SVG#</body></html>';
    var svgDocHeader = '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">';
    /**
     * Helper function to map svg file names to view 'pod' containing a "use" tag
     * @param {string} filepath svg full filepath including name and extension
     * @returns {string}
     */
    function useMapHelper(filepath) {
        var name = path.basename(filepath).replace('.svg', '');
        return '<div class="pod"><svg><use xlink:href="#' + name + '" /></svg><div class="title">'+name +'</div></div>';
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
            options.svginfo = svgDocHeader;
        }

        var file = stack.shift();
        if(file){
            try {
                var svgin = grunt.file.read(file).replace(rxStripCr,'').replace(rxStripWhitespace,'><').replace(rxEnableBg,'').replace(rxEnableBgStyle,'').replace(rxXWhiteSpace,'').replace(rxStripSize,'').replace(rxStripGrid,'');///.replace('<g>','').replace('<\/g>','');
                svgo.optimize(svgin, function (result) {
                    logger.log('write '+file);
                    options.svginfo+= result.data.replace('<svg ', '<symbol id="'+options.prefix+(path.basename(file).replace('.svg', ''))+'"').replace('<\/svg>','<\/symbol>').replace('xmlns="http://www.w3.org/2000/svg"','');

                    next(stack, options);
                });
            } catch (e) {
                //log error and continue
                logger.error(e);
                next(stack, options);
            }
        }else{
            //write svg tail
            options.svginfo+='</svg>';
        }
    }

    // Please see the Grunt documentation for more information regarding task
    // creation: http://gruntjs.com/creating-tasks

    grunt.registerMultiTask('cxsvg', 'The cx svg optimizer plugin.', function() {
        //load options
        var options = this.options({prefix:''});
        //get file list from glob and start processing
        //next(grunt.file.expand({cwd : options.dir}, '*.svg'), options);
        for (var i = 0, len = this.files.length; i < len; i++) {
            var file = this.files[i];
            //process the src files
            next(file.src, options);
            //write main output svg file to dest
            grunt.file.write(file.dest, options.svginfo);
            //write html view page
            var htmlPath = path.resolve(path.dirname(file.dest), path.basename(file.dest, '.svg') + '.html');
            grunt.file.write(htmlPath, htmlTemplate.replace('#SVG#',options.svginfo+options.useinfo));
            //cleanup for next round
            options.svginfo = options.useinfo = '';
        }
        //complete
        logger.log('all done');
    });

};
