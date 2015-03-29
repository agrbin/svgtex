"use strict";
var assert = require('assert');

var texvcjs = require('../');
var ast = texvcjs.ast;

// This tests the `contains_func` visitor function, which tests for a
// specific TeX function in the input string.
describe('ast.Tex.contains_func', function() {

    var testcases = [
        { input: '\\left(abc\\right)',  yes: ['\\left', '\\right'] },
        { input: '\\sin(x)+\\cos(x)^2', yes: ['\\sin', '\\cos'] },
        { input: '\\big\\langle',       yes: ['\\big', '\\langle'] },
        { input: '\\arccot(x) \\atop \\aleph',
          yes: ['\\operatorname', '\\atop', '\\aleph'],
          no:  ['\\arccot'] },
        { input: '\\acute{\\euro\\alef}',
          yes: ['\\acute', '\\euro', '\\aleph', '\\mbox' ],
          no:  ['\\alef'] },
        { input: '\\sqrt[\\backslash]{\\darr}',
          yes: ['\\sqrt', '\\backslash', '\\downarrow'],
          no:  ['\\darr'] },
        { input: '\\mbox{abc}',         yes: ['\\mbox'] },
        { input: 'x_\\aleph^\\sqrt{2}', yes: ['\\aleph','\\sqrt'] },
        { input: '{abc \\rm def \\it ghi}', yes: ['\\rm','\\it'] },
        { input: '{\\frac{\\sideset{_\\dagger}{^\\bold{x}}\\prod}{\\hat{a}}}',
          yes: ['\\frac','\\sideset','\\dagger','\\mathbf','\\prod','\\hat'],
          no:  ['\\bold'] },
        { input: '\\begin{array}{l|r}\n' +
                 '\\alpha & \\beta \\\\\n' +
                 '\\gamma & \\delta\n' +
                 '\\end{array}',
          yes: [ '\\begin{array}', '\\end{array}', '\\alpha', '\\beta',
                 '\\gamma', '\\delta' ],
          no:  [ '\\begin', '\\end', '\\hline' ]
        },
        { input: '\\begin{array}{l|r}\\hline a & b\\end{array}',
          yes: [ '\\begin{array}', '\\end{array}', '\\hline' ]
        },
        { input: '\\color[rgb]{0,1,.2}',
          yes: [ '\\color' ],
          no: [ '\\c', 'rgb', '\\pagecolor', '\\definecolor' ]
        },
        { input: '\\definecolor{blue}{cmyk}{1,0,0,0}\\pagecolor{blue}',
          yes: [ '\\definecolor', '\\pagecolor' ],
          no: [ '\\color', 'cmyk', 'blue', '\\blue' ]
        },
	    { input: '\\mathbb{R}',
		    yes: [ '\\mathbb' ],
		    no: [ 'R' ]
	    },
	    /*{ input: '\\reals',
		    yes: [ '\\mathbb{R}' ],
		    no: [ 'R' ]
	    }*/
    ];
    testcases.forEach(function(tc) {
        tc.no = (tc.no || []).concat(['\\foo', '\\begin{foo}']);
        [false,true].forEach(function(expected) {
            (expected ? tc.yes : tc.no).forEach(function(target) {
                it('should ' + (expected ? '' : 'not ') + 'find ' + target +
                   ' in ' + tc.input.replace(/\n/g,' '), function() {
                       var p = texvcjs.parse(tc.input, { debug: true });
                       assert.equal(texvcjs.contains_func(p, target),
                                    expected ? target : false);
                   });
            });
        });
    });
});
