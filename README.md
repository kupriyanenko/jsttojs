jsttojs
=======

A node.js module for precompile JavaScript templates (ex. mustache or jQuery.tmpl) to one file.


You can to precompile some static mustache, hogan.js, jQuery.tmpl, underscore.js or any other templates and include them in generated javascript function that could be stitched and compressed in a single file.

And if you set the flag --watch, you can compile templates automatically!

Installation
-----

    $ npm install jsttojs -g


Usage
-----

jsttojs allows templates to be precompiled and included in javascript code

```
Precompile JavaScript templates.
Usage: jsttojs <input> <output> [options]

Options:

  -h, --help        output usage information
  -V, --version     output the version number
  -e, --ext <n>     extension for templates, default "jst"
  -n, --name <n>    name variable stores temapltes, default "JSTmpl"
  -w, --watch       watch files and automatic compile output file

Examples:

  $ jsttojs templates compiled/templates/index.js --ext mustache --watch
```

Samples
-----

Templates:

```javascript
// tamplates/index.jst
Hello world {{ username }}
second line
```

```javascript
// tamplates/video/index.jst
Hello {{ username }} on index video page
```

Run precompile templates

    $ jsttojs templates compiled/templates/index.js --name MyGlobalVariable

Output:

```javascript
// compiled/templates/index.js
window.MyGlobalVariable = {
  "index" : "Hello world {{ username }} second line",
  "video/index" : "Hello {{ username }} on index video page"
}
```

License
-----

Copyright (c) 2012 Alexey Kupriyanenko a.kupriyanenko@gmail.com

jsttojs is released under the MIT license.