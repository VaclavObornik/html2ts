/*
 * grunt-html2ts
 * https://github.com/ufon/html2ts
 *
 * Copyright (c) 2013 Václav Oborník
 * Licensed under the MIT license.
 */

'use strict';

var fs = require('fs');
var path = require('path');
var _ = require('underscore');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerTask('html2ts', 'The best Grunt plugin ever.', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options();

    /////////////////////////////////////////////////////////////////////
    // HTML -> TS
    ////////////////////////////////////////////////////////////////////

    //html -> js processing functions:
    // Originally from karma-html2js-preprocessor
    // Refactored nicely in html2js grunt task
    // https://github.com/karlgoldstein/grunt-html2js/blob/master/tasks/html2js.js
    // Modified nlReplace to be an empty string
    var escapeContent = function (content, quoteChar) {
      var quoteRegexp = new RegExp('\\' + quoteChar, 'g');
      var nlReplace = '';
      return content.replace(quoteRegexp, '\\' + quoteChar).replace(/\r?\n/g, nlReplace);
    };

    // Remove bom when reading utf8 files
    function stripBOM(str) {
      return 0xFEFF == str.charCodeAt(0)
        ? str.substring(1)
        : str;
    }
    var htmlTemplate = _.template("module <%= modulename %> { export var <%= varname %> =  '<%= content %>'; } ");


    compileHTML(grunt.option('html2ts_file'), grunt.option('html2ts_base_dir'));

    // Compile an HTML file to a TS file
    // Return the filename. This filename will be required by reference.ts
    function compileHTML(filename, baseDir) {

      var htmlContent = escapeContent(fs.readFileSync(filename).toString(), "'");
      //htmlContent = stripBOM(htmlContent);
      // TODO: place a minification pipeline here if you want.

      var dirName;
      if(baseDir) {
        dirName = path.dirname(path.relative(baseDir, filename));
      } else {
        dirName = path.dirname(filename);
      }
      var moduleName = dirName.replace(/[\\\/]/g, '.') + '.template';
      moduleName = moduleName.replace('directives', 'directive');
      moduleName = moduleName.replace('services', 'service');
      moduleName = moduleName.replace('controllers', 'controller');
      moduleName = moduleName.replace('filters', 'filter');

      var ext = path.extname(filename);
      var extFreeName = path.basename(filename, ext).match(/^[a-zA-Z\-_]+/g)[0];
      var fileContent = htmlTemplate({ modulename: moduleName, varname: extFreeName, content: htmlContent });

      // Write the content to a file
      var outputfile = filename + ".ts";

      fs.writeFileSync(outputfile, fileContent);
      return outputfile;
    }


  });

};
