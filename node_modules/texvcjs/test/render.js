"use strict";
var assert = require('assert');

var Parser = require('../lib/parser');
var render = require('../lib/render');

var testcases = [
    { in: '' },
    { in: 'a' },
    { in: 'a^2', out: 'a^{2}' },
    { in: 'a^2+b^{2}', out: 'a^{2}+b^{2}' },
    { in: 'a^{2}+b^{2}' },
    { in: 'l_a^2+l_b^2=l_c^2',
      out:'l_{a}^{2}+l_{b}^{2}=l_{c}^{2}' },
    { in: '\\sin(x)+{}{}\\cos(x)^2 newcommand',
      out:'\\sin(x)+{}{}\\cos(x)^{2}newcommand' }
];

describe('Render', function() {
    testcases.forEach(function(tc) {
        var input = tc.in;
        var output = tc.out || input;
        it('should correctly render '+JSON.stringify(input), function() {
            assert.equal(render(Parser.parse(input)), output);
        });
    });
});
