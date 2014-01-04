/*!
 * JavaScript template precompiler
 * https://github.com/kupriyanenko/grunt-jsttojs
 * 
 * Copyright(c) 2012 Alexey Kupriyanenko <a.kupriyanenko@gmail.com>
 * MIT Licensed
 */

// Module dependencies
var fs = require('fs')
  , walk = require('walk')
  , watch = require('watch')
  , moment = require('moment')
  , path = require('path');

/**
 * Jsttojs
 */
function Jsttojs() {
  this.options = {};
}

Jsttojs.prototype = {
  /**
   * Create walker and files array
   * @param  {Function} callback
   * @return {walk}
   */
  createWalker: function(callback) {
    var walker
      , templates
      , files = [];

    walker = walk.walk(this.options.root, {
      followLinks: false
    });

    walker.on('file', function(root, stat, next) {
      if (stat.name.indexOf(this.options.ext) + this.options.ext.length === stat.name.length) {
        files.push(root + '/' + stat.name);
      }

      next();
    }.bind(this));

    walker.on('end', function() {
      templates = this.getTemplates(files);
      this.generateFiles(templates, callback);
    }.bind(this));

    return walker;
  },

  /**
   * Generate template and write in output file
   * @param  {Function} callback
   */
  generateFiles: function(templates, callback) {
    var data;

    if (this.options.amd) {
      data =  'define(';
      data += this.options.requirements ? JSON.stringify(this.options.requirements) + ',' : '';
      data += 'function() {return ';
      data += JSON.stringify(templates, null, 2) + ';';
      data += '});';
    } else {
      data = 'window.' + this.options.name + ' = ' + JSON.stringify(templates, null, 2);
    }

    fs.writeFile(this.options.output, data, function(err) {
      if (err) {
        return console.log("error, file don't write, check path!");
      }
      
      if (typeof callback != "undefined") {
        callback();
      }
    });
  },

  /**
   * Read files and get templates
   * @param {array} files
   * @return {object}
   */
  getTemplates: function(files) {
    var templates = {}
      , template
      , name;
    
    files.forEach(function(filename) {
      try {
        template = fs.readFileSync(filename, 'utf8');
      } catch(e) {
        return console.log(e);
      }

      if (this.options.removebreak) {
        template = template.replace(/(\n(\r)?(\t)?)/g, '');
        template = template.replace(/(\t)/g, '');
      }

      if (this.options.onlyName) {
        name = path.basename(filename, path.extname(filename));
      } else {
        name = filename.replace(this.options.root, '').replace('.' + this.options.ext, '').substring(1);
      }

      templates[name] = template;
    }, this);

    return templates;
  },

  /**
   * Compile templates
   * @param  {Object} options
   * @param  {Function} callback
   */
  compile: function(options, callback) {
    this.options = options;
    this.createWalker(callback);

    if (this.options.watch) {
      console.log(moment().format('[[]h:mm:ss YYYY-D-MM[]] ') + 'watch start...');

      watch.watchTree(this.options.root, {
          interval: 1000
        }, function (f, curr, prev) {
        if (typeof f == 'object' && prev === null && curr === null) {
          // Finished walking the tree
        } else {
          this.createWalker(callback);
        }
      }.bind(this));
    }
  }
}

module.exports = new Jsttojs;
