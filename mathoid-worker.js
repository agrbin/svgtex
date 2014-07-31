/*
 * Mathoid worker.
 *
 * Configure in storoid.config.json.
 */
// global includes
var express = require('express'),
	cluster = require('cluster'),
	http = require('http'),
	fs = require('fs'),
	child_process = require('child_process'),
	request = require('request'),
	querystring = require('querystring');
var mjAPI = require("./MathJaxNode/mj-single.js");

var format = "TeX";
var font = "TeX";

var config;

// Get the config
try {
	config = JSON.parse(fs.readFileSync('./mathoid.config.json', 'utf8'));
} catch ( e ) {
	// Build a skeleton localSettings to prevent errors later.
	console.error("Please set up your mathoid.config.json from the example " +
			"storoid.config.json.example");
	process.exit(1);
}

mjAPI.config({MathJax: {SVG: {font: font}}});
mjAPI.start();

/**
 * The name of this instance.
 * @property {string}
 */
var instanceName = cluster.isWorker ? 'worker(' + process.pid + ')' : 'master';

console.log( ' - ' + instanceName + ' loading...' );



/*
 * Backend setup
 */
var restarts = 10;

var backend,
	backendStarting = false,
	backendPort,
	requestQueue = [];

// forward declaration
var handleRequests;

var backendCB = function () {
	backendStarting = false;
	handleRequests();
};


/* -------------------- Web service --------------------- */


var app = express.createServer();

// Increase the form field size limit from the 2M default.
app.use(express.bodyParser({maxFieldsSize: 25 * 1024 * 1024}));
app.use( express.limit( '25mb' ) );

app.get('/', function(req, res){
	res.write('<html><body>\n');
	res.write('Welcome to Mathoid. POST to / with var <code>tex</code>');
	res.write('<form action="/" method="POST"><input type="text" name="q"></form>');
	res.end('</body></html>');
});

// robots.txt: no indexing.
app.get(/^\/robots.txt$/, function ( req, res ) {
	res.end( "User-agent: *\nDisallow: /\n" );
});


function handleRequest(req, res, q, type) {
	var mml = true;
	//Keep format variables constant
	if (type == "tex") {
		type = "TeX"
	}
	if (type == "mml" || type == "MathML") {
		type = "MathML"
		mml = false;
	}
	if (type == "ascii" || type == "asciimath") {
		type = "AsciiMath"
	}
	mjAPI.typeset({math: q, format: type, svg: true, img: true, mml: mml}, function (data) {
		if (data.errors) {
			data.success = false;
			data.log = "Error:" + JSON.stringify(data.errors);
		} else {
			data.success = true;
			data.log = "success";
		}
		var jsonData = JSON.stringify(data);
		errBuf = new Buffer(jsonData);
		res.writeHead(200,
			{
				'Content-Type': 'application/json',
				'Content-length': errBuf.length
			});
		res.end(errBuf);

		requestQueue.shift();
		handleRequests();
	});
}

handleRequests = function() {
	// Call the next request on the queue
	if (requestQueue.length) {
		requestQueue[0]();
	}
};


app.post(/^\/$/, function ( req, res ) {
	// First some rudimentary input validation
	if (!(req.body.q)) {
		res.writeHead(400);
		return res.end(JSON.stringify({error: "q (query) post parameter is missing!"}));
	}
	var q = req.body.q;
    var type = req.body.type;
    if (!(req.body.type) ){
        type = 'tex';
    }
	requestQueue.push(handleRequest.bind(null, req, res, q, type));
	// phantomjs only handles one request at a time. Enforce this.
	if (requestQueue.length === 1) {
		handleRequests();
	}

});


console.log( ' - ' + instanceName + ' ready' );

module.exports = app;

