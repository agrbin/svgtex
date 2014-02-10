/*
 * Storoid worker.
 *
 * Configure in storoid.config.json.
 */

// global includes
var express = require('express'),
	async = require('async'),
	request = require('request'),
	cluster = require('cluster'),
	http = require('http'),
	fs = require('fs'),
	childProcess = require('child_process');

var config;

// Get the config
try {
	config = JSON.parse(fs.readFileSync('./mathoid.config.json', 'utf8'));
} catch ( e ) {
	// Build a skeleton localSettings to prevent errors later.
	console.error('Please set up your mathoid.config.json from the example ' +
			'mathoid.config.json.example');
	process.exit(1);
}

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
/** jshint complains otherwise because those function call eachother */
var backendCB, startBackend;
function backendCB (err, stdout, stderr) {
	if (err) {
		restarts--;
		if (restarts > 0) {
			startBackend();
		}
		console.error(err.toString());
		process.exit(1);
	}
}

var backend,
	backendPort;
function startBackend () {
	if (backend) {
		backend.kill();
	}
	backendPort = Math.floor(1024 + Math.random() * 50000);
	console.error(instanceName + ': Starting backend on port ' + backendPort);
	backend = childProcess.exec('phantomjs main.js ' + backendPort, backendCB);
	backend.stdout.pipe(process.stdout);
	backend.stderr.pipe(process.stderr);
}
startBackend();

/* -------------------- Web service --------------------- */


var app = express.createServer();

// Increase the form field size limit from the 2M default.
app.use(express.bodyParser({maxFieldsSize: 25 * 1024 * 1024}));
app.use( express.limit( '25mb' ) );

app.get('/', function(req, res){
	res.write('<html><body>\n');
	res.write('Welcome to Mathoid. POST to / with var <code>tex</code>');
	res.write('<form action="/" method="POST"><input type="text" name="tex"></form>');
	res.end('</body></html>');
});

// robots.txt: no indexing.
app.get(/^\/robots.txt$/, function ( req, res ) {
	/*jshint quotmark:double */
	res.end( "User-agent: *\nDisallow: /\n" );
});


app.post(/^\/$/, function ( req, res ) {
	// First some rudimentary input validation
	if (!req.body.tex) {
		res.writeHead(400);
		return res.end(JSON.stringify({error: '\'tex\' post parameter is missing!'}));
	}
	// do the backend request
	var options = {
			hostname: 'localhost',
			port: backendPort.toString(),
			path: '/',
			method: 'POST',
			headers: {
				'Content-Length': req.body.tex.length,
				'Content-Type': 'application/x-www-form-urlencoded',
				'Connection': 'close'
			},
			agent: false
		},
		chunks = [],
		httpreq = http.request(options, function(httpres) {
			httpres.on('data', function(chunk) {
			chunks.push(chunk);
		});
		httpreq.on('end', function() {
			var buf = chunks.join('');
			res.writeHead(200,
			{
				'Content-type': 'application/json',
				'Content-length': buf.length
			});
			res.end(buf);
		});
	});
	httpreq.on('error', function(err) {
		console.log('error', err.toString());
		res.writeHead(500);
		return res.end(JSON.stringify({error: 'Backend error: ' + err.toString()}));
	});

	httpreq.write(new Buffer(req.body.tex));
	httpreq.end();


	//request.get('http://localhost:' + backendPort + '/' + req.body.tex,
	//	{},
	//	function(err, resp, body) {
	//		res.end(body);
	//	}
	//);

});


console.log( ' - ' + instanceName + ' ready' );

module.exports = app;

