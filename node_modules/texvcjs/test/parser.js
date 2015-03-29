"use strict";
var assert = require('assert');

var Parser = require('../lib/parser');

describe('Parse', function() {
    [ '', 'a', 'a^2', 'a^2+b^{2}', 'l_a^2+l_b^2=l_c^2' ].forEach(function(e) {
        it('should parse: '+JSON.stringify(e), function() {
            var p = Parser.parse(e);
            //console.log(JSON.stringify(e), '->', p.toString());
        });
    });
    it('should parse texvc example', function() {
        var e = '\\sin(x)+{}{}\\cos(x)^2 newcommand';
        var p = Parser.parse(e);
        //console.log(JSON.stringify(e), '->', p.toString());
    });
	it('should parse texvc specific functions', function() {
		var r = '\\reals',
			s = '\\mathbb{R}';
		var p = Parser.parse(r),
			q = Parser.parse(s);
		//assert.equal(p.toString(), q.toString());
		//console.log(JSON.stringify(s), '->', q.toString());
	});
});
