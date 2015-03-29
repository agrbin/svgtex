"use strict";
var assert = require('assert');
var texvcjs = require('../');

var fs = require('fs');
var path = require('path');

// set this variable to the path to your texvccheck binary for additional
// sanity-checking against the ocaml texvccheck.
var TEXVCBINARY = 0; // "../mediawiki/extensions/Math/texvccheck/texvccheck";

var getocaml = function(input, fixDoubleSpacing, done) {
    if (!TEXVCBINARY) { done( '-no texvcbinary') ; }
    var cp = require('child_process');
    cp.execFile(TEXVCBINARY, [input], { encoding: 'utf8' }, function(err,stdout,stderr) {
        if (err) { done( '-texvc error ' + err ); }
        if (stderr) { done( '-texvc stderror ' + stderr); }
        if (fixDoubleSpacing) { stdout = stdout.replace(/  /g, ' '); }
        done( stdout );
    });
};

var known_bad = Object.create(null);
var texvc_bugs = Object.create(null);
[
    // Illegal TeX function: \fint
    "\\fint",

    // Illegal TeX function: \for
    "\\for every",

    // wikitext!
    "</nowiki> tag exists if that was the only help page you read. If you looked at [[Help:Math]] (also known as [[Help:Displaying a formula]], [[Help:Formula]] and a bunch of other names), the first thing it says is \"MediaWiki uses a subset of TeX markup\"; a bit later, under \"[[Help:Math#Syntax|Syntax]]\", it says \"Math markup goes inside <nowiki><math> ... ",

     // colors should be 0-1, not 0-255
    {
        input: "\\definecolor{gray}{RGB}{249,249,249}\\pagecolor{gray} g \\mapsto g\\circ h",
        texvc: '+'
    },

    // unicode literal: ≠
    "\\frac{a}{b}, a, b \\in \\mathbb{Z}, b ≠ 0",

    // "Command \^ invalid in math mode"
    "\\gamma\\,\\pi\\,\\sec\\^2(\\pi\\,(p-\\tfrac{1}{2}))\\!",

    // html entity
    "\\mathbb{Q} \\big( \\sqrt{1 &ndash; p^2} \\big)",

    // unicode literal: ∈
    "p_k ∈ J",

    // unicode literal: −
    "(r−k)!",

    // colors are 0-1
    {
        input: "\\definecolor{red}{RGB}{255,0,0}\\pagecolor{red}e^{i \\pi} + 1 = 0\\,\\!",
        texvc: '+'
    },

    // anomalous @ (but this is valid in math mode)
    "ckl@ckl",

    // unicode literal: ×
    "u×v",

    // bad {} nesting
    "V_{\\text{in}(t)",

    // Illegal TeX function: \cdotP
    "\\left[\\begin{array}{c} L_R \\\\ L_G \\\\ L_B \\end{array}\\right]=\\mathbf{P^{-1}A^{-1}}\\left[\\begin{array}{ccc}R_w/R'_w & 0 & 0 \\\\ 0 & G_w/G'_w & 0 \\\\ 0 & 0 & B_w/B'_w\\end{array}\\right]\\mathbf{A\\cdotP}\\left[\\begin{array}{c}L_{R'} \\\\ L_{G'} \\\\ L_{B'} \\end{array}\\right]",

    // Illegal TeX function: \colour
    "\\colour{red}test",

    // unicode literal: ½
    "½",

    // unicode literal: …
    "…",

    // Illegal TeX function: \y
    " \\y (s)  ",

     // colors should be 0-1, not 0-255
    {
        input: "\\definecolor{orange}{RGB}{255,165,0}\\pagecolor{orange}z=re^{i\\phi}=x+iy \\,\\!",
        texvc: '+'
    },

    // should be \left\{ not \left{
    "\\delta M_i^{-1} = - \\propto \\sum_{n=1}^N D_i \\left[ n \\right] \\left[ \\sum_{j \\in C \\left{i\\right} } F_{j i} \\left[ n - 1 \\right] + Fext_i \\left[ n^-1 \\right] \\right]",

    // Illegal TeX function: \sout
    "\\sout{4\\pi x}",

    // unicode literal: −
    "~\\sin^{−1} \\alpha",

    // wikitext
    "\"</nowiki> and <nowiki>\"",

    // unicode literal (?): \201 / \x81
    "\\ x\x81'=ax+by+k_1",

    // wikitext
    "</nowiki></code> tag does not consistently italicize text which it encloses.  For example, compare \"<math>Q = d",

    // unicode literal: ²
    "x²",

    // Illegal TeX function: \grdot
    "\\grdot",

    // Illegal TeX function: \setin (also missing "}")
    "\\mathbb{\\hat{C}}\\setminus \\overline{\\mathbb{D}} = { w\\setin",

    // unicode literal: −
    "x−y",

    // Illegal TeX function: \spacingcommand
    "\\scriptstyle\\spacingcommand ",

    // unicode literal: π
    "e^{iπ} = \\cos(π) + i\\sin(π) \\!",

    // unicode literal: α
    "sin 2α",

     // colors should be 0-1, not 0-255
    {
        input: "\\definecolor{orange}{RGB}{255,165,0}\\pagecolor{orange}e^{i \\pi} + 1 = 0\\,\\!",
        texvc: '+'
    },

    // unicode literal: ∈
    "\\sum_{v=∈V}^{dv} i",

    // missing \right)
    "Q(x + \\alpha,y + \\beta) = \\sum_{i,j} a_{i,j} \\left( \\sum_u \\begin{pmatrix}i\\\\u\\end{pmatrix} x^u \\alpha^{i-u} \\right) \\left( \\sum_v",

    // missing \left)
    "\\begin{pmatrix}i\\\\v\\end{pmatrix} y^v \\beta^{j-v} \\right)",

    // unicode literal: ₃
    "i₃",

    // unicode literal: ≠
    "x ≠ 0",

    // unicode literals: α, →, β
    "((α → β) → α) → α",

    // unicode literal: −
    "(\\sin(\\alpha))^{−1}\\,",

    // wikitext
    "</nowiki>&hellip;<nowiki>",

    // not enough arguments to \frac
    "K_i = \\gamma^{L} _{i} * P_{i,Sat} \\frac{{P}}",

     // colors should be 0-1, not 0-255
    {
        input: "\\definecolor{gray}{RGB}{249,249,249}\\pagecolor{gray} g \\mapsto f\\circ g",
        texvc: '+'
    },

    // wikitext
    " it has broken spacing -->&nbsp;meters. LIGO should be able to detect gravitational waves as small as <math>h \\approx 5\\times 10^{-22}",

    // not enough arguments
    "\\binom",

    // unicode literal: −
    "\\text {E}=\\text {mgh}=0.1\\times980\\times10^{−2}=0.98\\text {erg}",

    // unicode literals: ⊈, Ō
    "⊈Ō",
].forEach(function(s) {
    if (typeof(s)==='string') { s = { input: s }; }
    known_bad[s.input] = true;
    if (s.texvc) {
        texvc_bugs[s.input] = true;
    }
});

// paper over insignificant differences between texvccheck and texvcjs
var normalize = function(s) {
    s = s.replace(/(\\[a-z]+)\s*\{/g, '$1 {');
    for (var os = s; ; os = s) {
        s = s.replace(/\{\{([^{}]*(|\{[^{}]*\}[^{}]*))\}\}/g, '{$1}');
        if (os === s) { break; }
    }
    return s;
};

// mocha is too slow if we run these as 287,201 individual test cases.
// run them in chunks in order to speed up reporting.
var CHUNKSIZE = 1000;

describe.skip('All formulae from en-wiki:', function() {
    this.timeout(0);

    // read test cases
    var formulae =  require('./en-wiki-formulae.json');

    // group them into chunks
    var mkgroups = function(arr, n) {
        var result = [], group = [];
        var seen = Object.create(null);
        arr.forEach(function(elem) {
            if (seen[elem.input]) { return; } else { seen[elem.input] = true; }
            group.push(elem);
            if (group.length >= n) {
                result.push(group);
                group = [];
            }
        });
        if (group.length > 0) {
        result.push(group);
        }
        return result;
    };
    var grouped = mkgroups(formulae, CHUNKSIZE);

    // create a mocha test case for each chunk
    grouped.forEach(function (group) {
        it(group[0].input + ' ... ' + group[group.length - 1].input, function () {
            group.forEach(function (testcase) {
                var f = testcase.input;
                var result = texvcjs.check(f);

                getocaml(testcase.input, true, function (texvccheck) {
                    var good = (result.status === '+');
                    var texvcstatus = texvccheck.charAt(0).
                        replace(/E/, 'S');
                    if (known_bad[f]) {
                        assert.ok(!good, f);
                        if (!texvc_bugs[f]) {
                            assert.equal(result.status, texvcstatus, 'bad? ' + JSON.stringify(testcase.inputhash));
                        }
                    } else {
                        assert.ok(good, f);
                        var r1 = texvcjs.check(result.output);
                        assert.equal(r1.status, '+', f + ' -> ' + result.output);
	                    if (result.status !== texvcstatus ){
		                    it('good? ' + JSON.stringify(testcase.inputhash),function(){
			                    assert.equal(result.status, texvcstatus ); });
	                    }
                        if (false) {
                            var r2 = texvcjs.check(texvccheck.slice(1));
                            // we should parse our output the same as the output
                            // from texvc.
                            assert.equal(r1.output, r2.output, f);
                        } else if (false) {
                            assert.equal(normalize(result.output),
                                normalize(texvccheck.slice(1)),
                                f);
                        }
                    }
                });
            });
        });
    });
});
