"use strict";
var assert = require('assert');
var texvcjs = require('../');

// set this variable to the path to your texvccheck binary for additional
// sanity-checking against the ocaml texvccheck.
var TEXVCBINARY=0; // "../../Math/texvccheck/texvccheck";

var tryocaml = function(input, output, done, fixDoubleSpacing) {
    if (!TEXVCBINARY) { return done(); }
    var cp = require('child_process');
    cp.execFile(TEXVCBINARY, [input], { encoding: 'utf8' }, function(err,stdout,stderr) {
        if (err) { return done(err); }
        if (stderr) { return done(stderr); }
        if (fixDoubleSpacing) { stdout = stdout.replace(/  /g, ' '); }
        assert.equal(stdout, '+' + output);
        done();
    });
};

var DELIMITERS1 =
    [ "(",")","[","]","\\{","\\}","|" ];
var DELIMITERS2 =
    ('\\backslash\\downarrow\\Downarrow\\langle\\lbrace\\lceil\\lfloor' +
     '\\llcorner\\lrcorner\\rangle\\rbrace\\rceil\\rfloor\\rightleftharpoons' +
     '\\twoheadleftarrow\\twoheadrightarrow\\ulcorner\\uparrow\\Uparrow' +
     '\\updownarrow\\Updownarrow\\urcorner\\Vert\\vert\\lbrack\\rbrack').
    split(/\\/).slice(1).map(function(f) { return "\\" + f; });
var DELIMITERS3 =
    ('\\darr\\dArr\\Darr\\lang\\rang\\uarr\\uArr\\Uarr').
    split(/\\/).slice(1).map(function(f) { return "\\" + f; });

describe('Comprehensive test cases', function() {
    var testcases = {
        'Box functions': {
            input:
                '\\text {-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF} '+
                '\\mbox {-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF} '+
                '\\hbox {-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF} '+
                '\\vbox {-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF} ',
            output:
                '{\\text{-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF}}'+
                '{\\mbox{-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF}}'+
                '{\\hbox{-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF}}'+
                '{\\vbox{-0-9a-zA-Z+*,=():/;?.!\'` \x80-\xFF}}',
        },
        'Box functions (2)': {
            input: '{\\text{ABC}}{\\mbox{ABC}}{\\hbox{ABC}}{\\vbox{ABC}}',
            skipOcaml: true /* extra braces in ocaml version */
        },
        'LaTeX functions': {
            input:
                '\\arccos \\arcsin \\arctan \\arg \\cosh \\cos \\cot \\coth ' +
                '\\csc \\deg \\det \\dim \\exp \\gcd \\hom \\inf \\ker \\lg ' +
                '\\lim \\liminf \\limsup \\ln \\log \\max \\min \\Pr \\sec ' +
                '\\sin \\sinh \\sup \\tan \\tanh '
        },
        'Mediawiki functions': {
            input:
                '\\arccot\\arcsec\\arccsc\\sgn\\sen',
            output:
                '\\operatorname {arccot} \\operatorname {arcsec} ' +
                '\\operatorname {arccsc} \\operatorname {sgn} ' +
                '\\operatorname {sen} '
        },
        'Literals (1)': {
            input:
                '\\aleph \\alpha \\amalg \\And \\angle \\approx ' +
                '\\approxeq \\ast \\asymp \\backepsilon \\backprime ' +
                '\\backsim \\backsimeq \\barwedge \\Bbbk \\because \\beta ' +
                '\\beth \\between \\bigcap \\bigcirc \\bigcup \\bigodot ' +
                '\\bigoplus \\bigotimes \\bigsqcup \\bigstar ' +
                '\\bigtriangledown \\bigtriangleup \\biguplus \\bigvee ' +
                '\\bigwedge \\blacklozenge \\blacksquare \\blacktriangle ' +
                '\\blacktriangledown \\blacktriangleleft \\blacktriangleright '+
                '\\bot \\bowtie \\Box \\boxdot \\boxminus \\boxplus ' +
                '\\boxtimes \\bullet \\bumpeq \\Bumpeq \\cap \\Cap \\cdot ' +
                '\\cdots \\centerdot \\checkmark \\chi \\circ \\circeq ' +
                '\\circlearrowleft \\circlearrowright \\circledast ' +
                '\\circledcirc \\circleddash \\circledS \\clubsuit \\colon ' +
                '\\complement \\cong \\coprod \\cup \\Cup ' +
                '\\curlyeqprec \\curlyeqsucc \\curlyvee \\curlywedge ' +
                '\\curvearrowleft \\curvearrowright \\dagger \\daleth ' +
                '\\dashv \\ddagger \\ddots \\delta \\Delta ' +
                '\\diagdown \\diagup \\diamond \\Diamond \\diamondsuit ' +
                '\\digamma \\displaystyle \\div \\divideontimes \\doteq ' +
                '\\doteqdot \\dotplus \\dots \\dotsb \\dotsc \\dotsi \\dotsm ' +
                '\\dotso \\doublebarwedge \\downdownarrows \\downharpoonleft ' +
                '\\downharpoonright \\ell \\emptyset \\epsilon \\eqcirc ' +
                '\\eqsim \\eqslantgtr \\eqslantless \\equiv \\eta \\eth ' +
                '\\exists \\fallingdotseq \\Finv \\flat \\forall \\frown ' +
                '\\Game \\gamma \\Gamma \\geq \\geqq \\geqslant \\gets \\gg ' +
                '\\ggg \\gimel \\gnapprox \\gneq \\gneqq \\gnsim \\gtrapprox ' +
                '\\gtrdot \\gtreqless \\gtreqqless \\gtrless \\gtrsim ' +
                '\\gvertneqq \\hbar \\heartsuit \\hookleftarrow ' +
                '\\hookrightarrow \\hslash \\iff \\iiiint \\iiint \\iint ' +
                '\\Im \\imath \\implies \\in \\infty \\injlim \\int ' +
                '\\intercal \\iota \\jmath \\kappa \\lambda \\Lambda \\land ' +
                '\\ldots \\leftarrow \\Leftarrow \\leftarrowtail ' +
                '\\leftharpoondown \\leftharpoonup \\leftleftarrows ' +
                '\\leftrightarrow \\Leftrightarrow \\leftrightarrows ' +
                '\\leftrightharpoons \\leftrightsquigarrow \\leftthreetimes ' +
                '\\leq \\leqq \\leqslant \\lessapprox \\lessdot ' +
                '\\lesseqgtr \\lesseqqgtr \\lessgtr \\lesssim \\limits \\ll ' +
                '\\Lleftarrow \\lll \\lnapprox \\lneq \\lneqq \\lnot \\lnsim ' +
                '\\longleftarrow \\Longleftarrow \\longleftrightarrow ' +
                '\\Longleftrightarrow \\longmapsto \\longrightarrow ' +
                '\\Longrightarrow \\looparrowleft \\looparrowright \\lor ' +
                '\\lozenge \\Lsh \\ltimes \\lVert \\lvertneqq \\mapsto ' +
                '\\measuredangle \\mho \\mid \\mod \\models \\mp \\mu ' +
                '\\multimap \\nabla \\natural \\ncong \\nearrow \\neg \\neq ' +
                '\\nexists \\ngeq \\ngeqq \\ngeqslant \\ngtr \\ni ' +
                '\\nleftarrow \\nLeftarrow \\nleftrightarrow ' +
                '\\nLeftrightarrow \\nleq \\nleqq \\nleqslant \\nless \\nmid ' +
                '\\nolimits \\not \\notin \\nparallel \\nprec \\npreceq ' +
                '\\nrightarrow \\nRightarrow \\nshortmid \\nshortparallel ' +
                '\\nsim \\nsubseteq \\nsubseteqq \\nsucc \\nsucceq ' +
                '\\nsupseteq \\nsupseteqq \\ntriangleleft \\ntrianglelefteq ' +
                '\\ntriangleright \\ntrianglerighteq \\nu \\nvdash \\nVdash ' +
                '\\nvDash \\nVDash \\nwarrow \\odot \\oint \\omega \\Omega ' +
                '\\ominus \\oplus \\oslash \\otimes ' +
                '\\P \\parallel \\partial ' +
                '\\perp \\phi \\Phi \\pi \\Pi \\pitchfork \\pm \\prec ' +
                '\\precapprox \\preccurlyeq \\preceq \\precnapprox ' +
                '\\precneqq \\precnsim \\precsim \\prime \\prod \\projlim ' +
                '\\propto \\psi \\Psi \\qquad \\quad \\Re \\rho \\rightarrow ' +
                '\\Rightarrow \\rightarrowtail \\rightharpoondown ' +
                '\\rightharpoonup \\rightleftarrows \\rightrightarrows ' +
                '\\rightsquigarrow \\rightthreetimes \\risingdotseq ' +
                '\\Rrightarrow \\Rsh \\rtimes \\rVert \\S ' +
                '\\scriptscriptstyle \\scriptstyle \\searrow \\setminus ' +
                '\\sharp \\shortmid \\shortparallel \\sigma \\Sigma \\sim ' +
                '\\simeq \\smallfrown \\smallsetminus \\smallsmile \\smile ' +
                '\\spadesuit \\sphericalangle \\sqcap \\sqcup \\sqsubset ' +
                '\\sqsubseteq \\sqsupset \\sqsupseteq \\square \\star ' +
                '\\subset \\Subset \\subseteq \\subseteqq \\subsetneq ' +
                '\\subsetneqq \\succ \\succapprox \\succcurlyeq \\succeq ' +
                '\\succnapprox \\succneqq \\succnsim \\succsim \\sum ' +
                '\\supset \\Supset \\supseteq \\supseteqq \\supsetneq ' +
                '\\supsetneqq \\surd \\swarrow \\tau \\textstyle ' +
                '\\therefore \\theta \\Theta ' +
                '\\thickapprox \\thicksim \\times \\to \\top \\triangle ' +
                '\\triangledown \\triangleleft \\trianglelefteq \\triangleq ' +
                '\\triangleright \\trianglerighteq ' +
                '\\upharpoonleft \\upharpoonright \\uplus \\upsilon ' +
                '\\Upsilon \\upuparrows \\varepsilon \\varinjlim ' +
                '\\varkappa \\varliminf \\varlimsup \\varnothing \\varphi ' +
                '\\varpi \\varprojlim \\varpropto \\varrho \\varsigma ' +
                '\\varsubsetneq \\varsubsetneqq \\varsupsetneq ' +
                '\\varsupsetneqq \\vartheta \\vartriangle \\vartriangleleft ' +
                '\\vartriangleright \\vdash \\Vdash \\vDash \\vdots \\vee ' +
                '\\veebar \\vline \\Vvdash \\wedge ' +
                '\\wp \\wr \\xi \\Xi \\zeta '
        },
        'Literals (2)': {
            input:
                '\\AA\\Coppa\\coppa\\Digamma\\euro\\geneuro\\geneuronarrow' +
                '\\geneurowide\\Koppa\\koppa\\officialeuro\\Sampi\\sampi' +
                '\\Stigma\\stigma\\textvisiblespace\\varstigma',
            output:
                '\\mbox{\\AA} \\mbox{\\Coppa} \\mbox{\\coppa} ' +
                '\\mbox{\\Digamma} \\mbox{\\euro} \\mbox{\\geneuro} ' +
                '\\mbox{\\geneuronarrow} \\mbox{\\geneurowide} ' +
                '\\mbox{\\Koppa} \\mbox{\\koppa} \\mbox{\\officialeuro} ' +
                '\\mbox{\\Sampi} \\mbox{\\sampi} \\mbox{\\Stigma} ' +
                '\\mbox{\\stigma} \\mbox{\\textvisiblespace} ' +
                '\\mbox{\\varstigma} '
        },
        'Literals (2\')': {
            /* We can parse what we emit (but the ocaml version can't) */
            input:
                '\\mbox{\\AA} \\mbox{\\Coppa} \\mbox{\\coppa} ' +
                '\\mbox{\\Digamma} \\mbox{\\euro} \\mbox{\\geneuro} ' +
                '\\mbox{\\geneuronarrow} \\mbox{\\geneurowide} ' +
                '\\mbox{\\Koppa} \\mbox{\\koppa} \\mbox{\\officialeuro} ' +
                '\\mbox{\\Sampi} \\mbox{\\sampi} \\mbox{\\Stigma} ' +
                '\\mbox{\\stigma} \\mbox{\\textvisiblespace} ' +
                '\\mbox{\\varstigma} ',
            skipOcaml: true
        },
        'Literals (3)': {
            input:
                '\\C\\H\\N\\Q\\R\\Z\\alef\\alefsym\\Alpha\\and\\ang\\Beta' +
                '\\bull\\Chi\\clubs\\cnums\\Complex\\Dagger\\diamonds\\Doteq' +
                '\\doublecap\\doublecup\\empty\\Epsilon\\Eta\\exist\\ge' +
                '\\gggtr\\hAar\\harr\\Harr\\hearts\\image\\infin\\Iota\\isin' +
                '\\Kappa\\larr\\Larr\\lArr\\le\\lrarr\\Lrarr\\lrArr\\Mu' +
                '\\natnums\\ne\\Nu\\O\\omicron\\Omicron\\or\\part\\plusmn' +
                '\\rarr\\Rarr\\rArr\\real\\reals\\Reals\\restriction\\Rho' +
                '\\sdot\\sect\\spades\\sub\\sube\\supe\\Tau\\thetasym' +
                '\\varcoppa\\weierp\\Zeta',
            output:
                '\\mathbb{C} \\mathbb{H} \\mathbb{N} \\mathbb{Q} \\mathbb{R}' +
                ' \\mathbb{Z} \\aleph \\aleph \\mathrm{A} \\land \\angle' +
                ' \\mathrm{B} \\bullet \\mathrm{X} \\clubsuit \\mathbb{C}' +
                ' \\mathbb{C} \\ddagger \\diamondsuit \\doteqdot \\Cap \\Cup ' +
                '\\emptyset \\mathrm{E} \\mathrm{H} \\exists \\geq \\ggg ' +
                '\\Leftrightarrow \\leftrightarrow \\Leftrightarrow \\heartsuit' +
                ' \\Im \\infty \\mathrm{I} \\in \\mathrm{K} \\leftarrow \\Leftarrow ' +
                '\\Leftarrow \\leq \\leftrightarrow \\Leftrightarrow \\Leftrightarrow' +
                ' \\mathrm{M} \\mathbb{N} \\neq \\mathrm{N} \\emptyset \\mathrm{o} ' +
                '\\mathrm{O} \\lor \\partial \\pm \\rightarrow \\Rightarrow \\Rightarrow' +
                ' \\Re \\mathbb{R} \\mathbb{R} \\upharpoonright \\mathrm{P} \\cdot \\S ' +
                '\\spadesuit \\subset \\subseteq \\supseteq \\mathrm{T} \\vartheta \\mbox{\\coppa}' +
                ' \\wp \\mathrm{Z} '
        },
        'Big': (function() {
            var BIGS = ('\\big\\Big\\bigg\\Bigg\\biggl\\Biggl\\biggr\\Biggr' +
             '\\bigl\\Bigl\\bigr\\Bigr').split(/\\/).slice(1);
            var DELIMITERS = DELIMITERS1.concat(DELIMITERS2).
                concat(["\\darr","\\uarr"]);
            var input = BIGS.map(function(b) {
                return DELIMITERS.map(function(d) {
                    return "\\" + b + d;
                }).join('');
            }).join('');
            var output = BIGS.map(function(b) {
                return DELIMITERS.map(function(d) {
                    if (d === "\\darr") { d = "\\downarrow"; }
                    if (d === "\\uarr") { d = "\\uparrow"; }
                    if (d.charAt(0)==='\\' && d.length > 2) { d = d + " "; }
                    return "{\\" + b + " " + d + "}";
                }).join('');
            }).join('');
            return { input: input, output: output };
        })(),
        'Delimiters (1)': {
            input: DELIMITERS1.join('') + DELIMITERS2.join(' ') + ' '
        },
        'Delimiters (2)': {
            input:
                '\\darr\\dArr\\Darr\\lang\\rang\\uarr\\uArr\\Uarr',
            output:
                '\\downarrow \\Downarrow \\Downarrow \\langle \\rangle ' +
                '\\uparrow \\Uparrow \\Uparrow '
        },
        'Delimiters (3)': {
            input:
            '\\left' + DELIMITERS1.join('\\left') +
            '\\right' + DELIMITERS1.slice().reverse().join('\\right')
        },
        'Delimiters (4)': {
            input:
            '\\left' + DELIMITERS2.join(' \\left') +
            ' \\right' + DELIMITERS2.slice().reverse().join(' \\right') + ' '
        },
        'Delimiters (5)': {
            input:
                '\\left\\darr \\left\\dArr \\left\\Darr \\left\\lang ' +
                '\\right\\rang \\right\\uarr \\right\\uArr \\right\\Uarr ',
            output:
                '\\left\\downarrow \\left\\Downarrow \\left\\Downarrow ' +
                '\\left\\langle \\right\\rangle ' +
                '\\right\\uparrow \\right\\Uparrow \\right\\Uparrow '
        },
        'FUN_AR1': {
            input:
                '\\acute{A}\\bar{A}\\bcancel{A}\\bmod{A}\\boldsymbol{A}' +
                '\\breve{A}\\cancel{A}\\check{A}\\ddot{A}\\dot{A}\\emph{A}' +
                '\\grave{A}\\hat{A}\\mathbb{A}\\mathbf{A}\\mathbin{A}' +
                '\\mathcal{A}\\mathclose{A}\\mathfrak{A}\\mathit{A}' +
                '\\mathop{A}\\mathopen{A}\\mathord{A}\\mathpunct{A}' +
                '\\mathrel{A}\\mathrm{A}\\mathsf{A}\\mathtt{A}' +
                '\\operatorname{A}\\overleftarrow{A}\\overleftrightarrow{A}' +
                '\\overline{A}\\overrightarrow{A}\\pmod{A}\\sqrt{A}' +
                '\\textbf{A}\\textit{A}\\textrm{A}\\textsf{A}\\texttt{A}' +
                '\\tilde{A}\\underline{A}\\vec{A}\\widehat{A}\\widetilde{A}' +
                '\\xcancel{A}\\xleftarrow{A}\\xrightarrow{A}',
            output:
                '{\\acute {A}}{\\bar {A}}{\\bcancel {A}}{\\bmod {A}}' +
                '{\\boldsymbol {A}}{\\breve {A}}{\\cancel {A}}{\\check {A}}' +
                '{\\ddot {A}}{\\dot {A}}{\\emph {A}}{\\grave {A}}{\\hat {A}}' +
                '\\mathbb {A} \\mathbf {A} {\\mathbin {A}}{\\mathcal {A}}' +
                '{\\mathclose {A}}{\\mathfrak {A}}{\\mathit {A}}' +
                '{\\mathop {A}}{\\mathopen {A}}{\\mathord {A}}' +
                '{\\mathpunct {A}}{\\mathrel {A}}\\mathrm {A} {\\mathsf {A}}' +
                '{\\mathtt {A}}\\operatorname {A} {\\overleftarrow {A}}' +
                '{\\overleftrightarrow {A}}{\\overline {A}}' +
                '{\\overrightarrow {A}}{\\pmod {A}}{\\sqrt {A}}' +
                '{\\textbf {A}}{\\textit {A}}{\\textrm {A}}{\\textsf {A}}' +
                '{\\texttt {A}}{\\tilde {A}}{\\underline {A}}{\\vec {A}}' +
                '{\\widehat {A}}{\\widetilde {A}}{\\xcancel {A}}' +
                '{\\xleftarrow {A}}{\\xrightarrow {A}}',
            skipOcaml: 'double spacing and extra braces'
        },
        'FUN_AR1 (2)': {
            input: '\\Bbb{foo}\\bold{bar}',
            output: '{\\mathbb {foo}}{\\mathbf {bar}}',
            skipOcaml: 'double spacing',
            skipReparse: 'spacing'
        },
        'FUN_AR1NB (1)': {
            input: '\\operatorname {sin} ',
            skipOcaml: 'missing space'
        },
        'FUN_AR1NB (2)': {
            input: '\\mathbb {A} \\mathbf {B} \\mathrm {C} ',
            skipOcaml: 'extra braces'
        },
        'FUN_AR1NB (3)': {
            input: '\\overbrace {A} _{b}^{c}\\underbrace {C} _{d}^{e}',
            skipOcaml: 'ocaml bug'
        },
        'FUN_AR1OPT': {
            input:
                '\\sqrt{2}\\sqrt[3]{2}' +
                '\\xleftarrow{above}\\xleftarrow[below]{above}' +
                '\\xrightarrow{above}\\xrightarrow[below]{above}',
            output:
                '{\\sqrt {2}}{\\sqrt[{3}]{2}}' +
                '{\\xleftarrow {above}}{\\xleftarrow[{below}]{above}}' +
                '{\\xrightarrow {above}}{\\xrightarrow[{below}]{above}}',
            skipOcaml: 'spacing'
        },
        'FUN_AR2': {
            input:
                '\\binom{A}{B}\\cancelto{A}{B}\\cfrac{A}{B}\\dbinom{A}{B}' +
                '\\dfrac{A}{B}\\frac{A}{B}\\overset{A}{B}\\stackrel{A}{B}' +
                '\\tbinom{A}{B}\\tfrac{A}{B}\\underset{A}{B}',
            output:
                '{\\binom {A}{B}}{\\cancelto {A}{B}}{\\cfrac {A}{B}}' +
                '{\\dbinom {A}{B}}{\\dfrac {A}{B}}{\\frac {A}{B}}' +
                '{\\overset {A}{B}}{\\stackrel {A}{B}}{\\tbinom {A}{B}}' +
                '{\\tfrac {A}{B}}{\\underset {A}{B}}',
            skipOcaml: 'double spacing'
        },
        'FUN_AR2nb': {
            input: '\\sideset{_\\dagger^*}{_\\dagger^*}\\prod',
            output: '\\sideset {_{\\dagger }^{*}}{_{\\dagger }^{*}}\\prod '
        },
        'FUN_INFIX (1)': {
            input: '\\left({a\\atop 1}{b\\atop m}{c\\atop n}\\right)',
            output: '\\left({a \\atop 1}{b \\atop m}{c \\atop n}\\right)'
        },
        'FUN_INFIX (2)': {
            input: '{1\\,0\\choose0\\,1}',
            output: '{1\\,0 \\choose 0\\,1}'
        },
        'FUN_INFIX (3)': {
            input: '{a\\over b}',
            output: '{a \\over b}'
        },
        'FUN_INFIX (4)': {
            input: 'a\\over b',
            output: '{a \\over b}'
        },
        'DECLh': {
            input: '{abc \\rm def \\it ghi \\cal jkl \\bf mno}',
            output: '{abc{\\rm {def{\\it {ghi{\\cal {jkl{\\bf {mno}}}}}}}}}'
        },
        'litsq_zq': {
            input: ']^2',
            output: ']^{2}'
        },
        'Matrices (1)': (function() {
            var ENV =
                ['matrix','pmatrix','bmatrix','Bmatrix','vmatrix','Vmatrix',
                 'array','align','alignat','smallmatrix','cases'];
            var arg = function(env) {
                switch (env) {
                case 'array': return '{|c||c|}';
                case 'alignedat': case 'alignat': return '{3}';
                default: return '';
                }
            };
            return {
                input: ENV.map(function(env) {
                    return '\\begin{'+env+'}'+arg(env)+' a & b \\\\\\hline c & d \\end{'+env+'}';
                }).join(''),
                output: ENV.map(function(env) {
                    if (env==='align') { env = 'aligned'; }
                    if (env==='alignat') { env = 'alignedat'; }
                    return '{\\begin{'+env+'}'+arg(env)+'a&b\\\\\\hline c&d\\end{'+env+'}}';
                }).join('')
            };
        })(),
        'Matrices (2)': {
            input: '{\\begin{array}{|c|}\\hline {\\!n\\!}\\\\\\hline \\end{array}}'
        },
        'Matrices (3)': {
            input: '\\begin{alignedat} { 3 } a & b & c \\end{alignedat}',
            output: '{\\begin{alignedat}{3}a&b&c\\end{alignedat}}'
        },
        'Color (1)': {
            input: '\\definecolor {mycolor}{rgb}{0.1,.2,0.}\\color {mycolor}'
        },
        'Color (2)': {
            input:
                '\\color {blue}\\color [named]{blue}\\color [gray]{0.5}' +
                '\\color [rgb]{0,1,0}\\color [cmyk]{1,0,0,0}'
        },
        'Color (3)': {
            input:
                '\\pagecolor {blue}\\pagecolor [named]{blue}' +
                '\\pagecolor [gray]{0.5}\\pagecolor [rgb]{0,1,0}' +
                '\\pagecolor [cmyk]{1,0,0,0}'
        },
        'Color (4)': {
            input:
                '\\definecolor{mycolor}{RGB}{0.1,.2,0.}\\color[CMYK]{0,1,0,1}',
            output:
                '\\definecolor {mycolor}{rgb}{0.1,.2,0.}\\color [cmyk]{0,1,0,1}'
        },
        'Unicode': {
            input: '{\\mbox{💩\uD83D\uDCA9}}'
        }
    };
    Object.keys(testcases).forEach(function(title) {
        describe(title, function() {
            var tc = testcases[title];
            tc.output = tc.output || tc.input;
            if (!tc.skipJs) {
                it('output should be correct', function() {
                    var result = texvcjs.check(tc.input, { debug: true });
                    assert.equal(result.status, '+');
                    assert.equal(result.output, tc.output);
                });
            }
            if (!tc.skipReparse) {
                // verify that the output doesn't change if we feed it
                // through again.
                it('should parse its own output', function() {
                    var result1 = texvcjs.check(tc.output, { debug: true });
	                var result2 = texvcjs.check(result1.output, { debug: true });
                    assert.equal(result2.status, '+');
                    assert.equal(result2.output, result1.output);
                });
            }
            if (!tc.skipOcaml) {
                it('should match ocaml output', function(done) {
                    tryocaml(tc.input, tc.output, done);
                });
            }
            if (tc.skipOcaml === 'double spacing') {
                it('should match ocaml output (except for spacing)', function(done) {
                    tryocaml(tc.input, tc.output, done, true);
                });
            }
        });
    });
});
