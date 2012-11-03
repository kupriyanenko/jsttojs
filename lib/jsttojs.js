/*!
 * JavaScript template precompiler
 * Copyright(c) 2012 Alexey Kupriyanenko <a.kupriyanenko@gmail.com>
 * MIT Licensed
 */

var fs      = require('fs');
var walk    = require('walk');
var options = require('commander');

// Get options
options
  .version('0.0.1')
  .usage('<input> <output> [options]')
  .option('-e, --ext <n>', 'extension for templates, default "jst"', 'jst')
  .option('-n, --name <n>', 'name variable stores temapltes, default "JSTmpl"', 'JSTmpl')
  .parse(process.argv);

options.root = process.argv[2];
options.output = process.argv[3];

// Check options
if (!options.root || !options.output)
  options.help();

// Get files from root derictory
var files  = [];
var walker = walk.walk(options.root, { followLinks: false });

walker.on('file', function(root, stat, next) {
  if (stat.name.indexOf(options.ext) + options.ext.length === stat.name.length)
    files.push(root + '/' + stat.name);

  next();
});

// Generate templates after read templates
walker.on('end', function() {
  var templates = readTemplates(files);

  generateTemplates(templates);
});

/**
 * Read files and get templates
 * @param Array files
 * @return Object
 */
var readTemplates = function(files) {
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
    var index = path.replace(options.root, '').replace('.' + options.ext, '').substring(1);

    templates[index] = template;
  });

  return templates;
}

/**
 * Generate template and write in output file
 * @param Object templates
 */
var generateTemplates = function(templates) {
  var data = 'window.' + options.name + ' = ' + JSON.stringify(templates, null, 4);

  fs.writeFile(options.output, data, function(err) {
    if (err)
      return console.log(err);
    
    console.log('complete: ' + options.output);
  });
}
