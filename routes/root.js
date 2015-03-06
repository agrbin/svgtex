'use strict';


var sUtil = require('../lib/util');


/**
 * The main router object
 */
var router = sUtil.router();
var texvcjs = require('texvcjs');


/**
 * The main application object reported when this module is require()d
 */
var app;

/**
 * GET /robots.txt
 * Instructs robots no indexing should occur on this domain.
 */
router.get('/robots.txt', function(req, res) {

    res.set({
        'User-agent': '*',
        'Disallow': '/'
    }).end();

});

function handleRequest(req, res, q, type) {
    var mml = true;
    var sanitizedTex;
    //Keep format variables constant
    if (type === "tex") {
        type = "TeX";
        var sanitizationOutput = texvcjs.check(q);
        // XXX properly handle errors here!
        if (sanitizationOutput.status === '+') {
            sanitizedTex = sanitizationOutput.output || '';
            q = sanitizedTex;
        } else {
            res.writeHead(400, {
                'Content-Type': 'application/json'
            });
            return res.end(JSON.stringify({
                success: false,
                log: sanitizationOutput.status + ': ' + sanitizationOutput.details
            }));
        }

    }
    if (type === "mml" || type === "MathML") {
        type = "MathML";
        mml = false;
    }
    if (type === "ascii" || type === "asciimath") {
        type = "AsciiMath";
    }
    app.mjAPI.typeset({math: q, format: type, svg: true, img: true, mml: mml, speakText: true}, function (data) {
        if (data.errors) {
            data.success = false;
            data.log = "Error:" + JSON.stringify(data.errors);
        } else {
            data.success = true;
            data.log = "success";
        }

        // Strip some styling returned by MathJax
        if (data.svg) {
            data.svg = data.svg.replace(/style="([^"]+)"/, function(match, style) {
                return 'style="'
                    + style.replace(/(?:margin(?:-[a-z]+)?|position):[^;]+; */g, '')
                    + '"';
            });
        }

        // Return the sanitized TeX to the client
        if (sanitizedTex !== undefined) {
            data.sanetex = sanitizedTex;
        }

        res.writeHead(200, {
            'Content-Type': 'application/json'
        });
        res.end(JSON.stringify(data));
    });
}
/**
 * GET /robots.txt
 * Instructs robots no indexing should occur on this domain.
 */
router.post(/^\/$/, function(req, res) {

    // First some rudimentary input validation
    if (!(req.body.q)) {
        res.writeHead(400);
        //TODO: Can we simply use res.json?
        return res.end(JSON.stringify({error: "q (query) post parameter is missing!"}));
    }
    var q = req.body.q;
    var type = req.body.type;
    if (!(req.body.type) ){
        type = 'tex';
    }
    handleRequest(req, res, q, type);

});


module.exports = function(appObj) {

    app = appObj;
    return {
        path: '/',
        skip_domain: true,
        router: router
    };

};

