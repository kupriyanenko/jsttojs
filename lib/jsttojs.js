/*!
 * JavaScript template precompiler
 * https://github.com/kupriyanenko/grunt-jsttojs
 * 
 * Copyright(c) 2012 Alexey Kupriyanenko <a.kupriyanenko@gmail.com>
 * MIT Licensed
 */

// Module dependencies
var fs = require('fs');
var walk = require('walk');
var watchTree = require("fs-watch-tree").watchTree;

/**
 * Jsttojs
 */
function Jsttojs() {
  this.options = {};
  this.files = [];
}

Jsttojs.prototype = {
  /**
   * Create walker and files array
   * @param  {Function} callback
   * @return {walk}
   */
  createWalker: function(callback) {
    var that = this
      , walker;

    this.files = [];

    walker = walk.walk(this.options.root, {
      followLinks: false
    });

    walker.on('file', function(root, stat, next) {
      if (stat.name.indexOf(that.options.ext) + that.options.ext.length === stat.name.length) {
        that.files.push(root + '/' + stat.name);
      }

      next();
    });

    walker.on('end', function() {
      that.generateFiles(callback);
    });

    return walker;
  },

  /**
   * Generate template and write in output file
   * @param  {Function} callback
   */
  generateFiles: function(callback) {
    var templates = this.getTemplates()
      , that = this
      , data;

    if (this.options.amd) {
      data =  'define(';
      data += that.options.requirements ? JSON.stringify(that.options.requirements) + ',' : '';
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
  getTemplates: function() {
    var templates = {}
      , that = this
      , template
      , index;
    
    this.files.forEach(function(path) {
      try {
        template = fs.readFileSync(path, 'utf8');
      } catch(e) {
        return console.log(e);
      }

      if (that.options.removebreak) {
        template = template.replace(/(\n(\r)?(\t)?)/g, '');
        template = template.replace(/(\t)/g, '');
      }

      index = path.replace(that.options.root, '').replace('.' + that.options.ext, '').substring(1);

      templates[index] = template;
    });

    return templates;
  },

  /**
   * Compile templates
   * @param  {Object} options
   * @param  {Function} callback
   */
  compile: function(options, callback) {
    var that = this;

    this.options = options;
    this.createWalker(callback);

    if (this.options.watch) {
      console.log('watch start...');

      watchTree(this.options.root, function (event) {
        that.createWalker(callback);
      });
    }
  }
}

module.exports = new Jsttojs;