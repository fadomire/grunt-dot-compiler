/*
 * grunt-hogan-client
 * https://github.com/markus.ullmark/grunt-hogan-client
 *
 * Copyright (c) 2012 Markus Ullmark
 * Licensed under the MIT license.
 */

module.exports = function(grunt) {

	"use strict";

	grunt.util = grunt.util || grunt.utils;
	
	var _ = grunt.utils._;

	var path = require('path'),
		fs = require('fs'),
		cleaner = /^\s+|\s+$|[\r?\n]+/gm;

	// Please see the grunt documentation for more information regarding task and
	// helper creation: https://github.com/gruntjs/grunt/blob/master/docs/toc.md

	// ==========================================================================
	// TASKS
	// ==========================================================================

	grunt.registerMultiTask('templateclient', 'prepares and combines any type of template into a script include', function() {
		// grap the filepattern
		var files = grunt.file.expandFiles(this.file.src);
		// create the hogan include
		var src = grunt.helper('templateclient', files, this.data.options);
		// write the new file
		grunt.file.write(this.file.dest, src);
		// log our success
		grunt.log.writeln('File "' + this.file.dest + '" created.');
	});

	// ==========================================================================
	// HELPERS
	// ==========================================================================

	grunt.registerHelper('templateclient', function(files, options) {
		var js = '';

		options = _.defaults(options || {}, {
			variable: 'tmpl',
			key: function(filepath) {
				return path.basename(filepath, path.extname(filepath));
			},
			prefix: 'Hogan.compile(',
			suffix: ')'
		});
		
		options.variable = options.variable.replace('window.', '');

		js += '(function compileTemplates() {' + grunt.utils.linefeed;
		
		var currentVar = 'window';
		var variables = options.variable.split('.');
		
		_.each(variables, function(v) {
			currentVar = currentVar + '.' + v;
			js += '	' + currentVar + '=' + currentVar + '||{};' + grunt.utils.linefeed;
		});
		
		files.map(function(filepath) {
			
			var key = options.key(filepath);
			var contents = grunt.file.read(filepath).replace(cleaner, '').replace(/'/g, "\\'");
			
			js += '	' + options.variable + "['" + key + "']=" + options.prefix + '\'' + contents + '\'' + options.suffix + ';' + grunt.utils.linefeed;
		});

		js += '}());' + grunt.utils.linefeed;

		return js;
	});

};
