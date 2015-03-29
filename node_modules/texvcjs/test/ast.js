// Test AST.
"use strict";
var assert = require('assert');

var ast = require('../lib/ast');

describe('AST', function() {
    it('should construct and stringify', function() {
        var x = ast.Tex.LITERAL(ast.RenderT.TEX_ONLY('a'));
        var y = ast.Tex.UQN(x);
        var z = ast.Tex.CURLY([x, y]);

        assert.equal(z.toString(), 'CURLY([LITERAL(TEX_ONLY("a")),UQN(LITERAL(TEX_ONLY("a")))])');
    });
});
