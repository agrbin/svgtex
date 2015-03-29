// Helper module to re/build the PEGJS parser.
"use strict";

var INPUT_FILE = __dirname + '/parser.pegjs';
var OUTPUT_FILE = __dirname + '/parser.js';

var buildParser = module.exports = function(inFile, outFile) {
    var PEG = require('pegjs');
    var fs = require('fs');

    var parserSource = PEG.buildParser(fs.readFileSync(inFile, 'utf8'), {
        /* PEGJS options */
        output: "source",
        cache: true,// makes repeated calls to generic_func production efficient
        allowedStartTules: [ "start" ]
    });
    // hack up the source to make it pass jshint
    parserSource = parserSource
        .replace(/peg\$subclass\(child, parent\) {/g, function(m) {
            return m + "\n    /*jshint validthis:true, newcap:false */";
        }).replace(/\n(\s+)([?:+]) (expectedDescs|" or ")/g, ' $2\n$1$3');
    parserSource =
        '/* jshint latedef: nofunc */\n' +
        '"use strict";\n' +
        'module.exports = ' + parserSource + ';';

    fs.writeFileSync(outFile, parserSource, 'utf8');
};

buildParser(INPUT_FILE, OUTPUT_FILE);
