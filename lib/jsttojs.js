/*!
 * JavaScript template precompiler
 * Copyright(c) 2012 Alexey Kupriyanenko <a.kupriyanenko@gmail.com>
 * MIT Licensed
 */

var fs        = require('fs')
  , walk      = require('walk')
  , options   = require('commander')
  , watchTree = require("fs-watch-tree").watchTree;

// Get options
options
  .version('0.0.2')
  .usage('<input> <output> [options]')
  .option('-e, --ext <n>', 'extension for templates, default "jst"', 'jst')
  .option('-n, --name <n>', 'name variable stores temapltes, default "JSTmpl"', 'JSTmpl')
  .option('-w, --watch', 'watch files and automatic compile output file')
  .parse(process.argv);

// Check options
if (!process.argv[2] || !process.argv[3])
  options.help();

options.root   = process.argv[2].replace(/\/$/, '');
options.output = process.argv[3];

var files = [];

/**
 * Create walker and files array
 */
function createWalker() {
  var walker  = walk.walk(options.root, { followLinks: false });
  files       = [];

  walker.on('file', function(root, stat, next) {
    if (stat.name.indexOf(options.ext) + options.ext.length === stat.name.length)
      files.push(root + '/' + stat.name);

    next();
  });

  walker.on('end', function() {
    generateFiles();
  });
}

createWalker();

/**
 * Generate template and write in output file
 * @param String event
 */
function generateFiles(event) {
  var templates = getTemplates(files)
    , data = 'window.' + options.name + ' = ' + JSON.stringify(templates, null, 4);

  fs.writeFile(options.output, data, function(err) {
    if (err)
      return console.log("error, file don't write, check path!");
    
    console.log('complete: ' + options.output);
  });
}

/**
 * Read files and get templates
 * @param Array files
 * @return Object
 */
function getTemplates(files) {
  var templates = {}
    , template;
  
  files.forEach(function(path) {
    try {
      template = fs.readFileSync(path, 'utf8');
    } catch(e) {
      console.log(e);
      return;
    }

    template  = template.replace(/(\n(\r)?)/g, ' ');
    var index = path.replace(options.root, '').replace('.' + options.ext, '').substring(1);;

    templates[index] = template;
  });

  return templates;
}

// Watch files
if (options.watch) {
  console.log('watch start...');

  var watch = watchTree(options.root, function (event) {
    createWalker();
  });
}
