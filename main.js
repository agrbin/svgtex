// this script will set up a HTTP server on this port (local connections only)
// and will receive POST requests (not urlencoded)
var PORT = 16000;

// server will process this many queries and then exit. (-1, never stop).
var REQ_TO_LIVE = -1;

var server = require('webserver').create();
var page = require('webpage').create();
var args = require('system').args;
var activeRequests = {};
var service = null;

if (args.length > 1) {
	PORT = args[1];
}

// thanks to:
// stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
function utf8Strlen(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

page.onCallback = function(data) {
	var out,
		log = '',
		record = activeRequests[data[0]],
		resp = record[0],
		t = ', took ' + (((new Date()).getTime() - record[1])) + 'ms.';

	if ((typeof data[1]) === 'string') {
		resp.statusCode = 200;
		log = data[0].substr(0, 30) + '.. ' + data[0].length + 'B query, OK ' + data[1].length  + '/' + data[2].length  + 'B result' + t;
		out = JSON.stringify({tex:data[0],svg:data[1],mml:data[2],'log':log, 'sucess':true});
		resp.setHeader('Content-Type', 'application/json');
		resp.setHeader('Content-Length', utf8Strlen(out) );
		resp.write(out);
		console.log(log);
	} else {
		resp.statusCode = 400;
		log = data[0].substr(0, 30) + '.. ' +
		data[0].length + 'B query, ERR ' + data[1][0] + t;
		out = JSON.stringify({err:data[1][0],svg:data[1],mml:data[2],'log':log,'sucess':false});
		resp.write(out);
		console.log(log);
	}
	resp.close();
	if (!(--REQ_TO_LIVE)) {
		phantom.exit();
	}
};

console.log('loading bench page');
page.open('index.html', function ( ) {

	service = server.listen('127.0.0.1:' + PORT, function(req, resp) {
		var query;
		if (req.method === 'GET') {
			// URL starts with /? and is urlencoded.
			query = decodeURI(req.url.substr(2));
		} else {
			query = req.postRaw;
			console.log(query);
		}
		activeRequests[query] = [resp, (new Date()).getTime()];
		// this is just queueing call, it will return at once.
		page.evaluate(function(q) {
			window.engine.process(q, window.callPhantom);
		}, query);
	});

	if (!service) {
		console.log('server failed to start on port ' + PORT);
		phantom.exit(1);
	} else {
		console.log('server started on port ' + PORT);
		console.log('you can hit server with http://localhost:' + PORT + '/?2^n');
		console.log('.. or by sending tex source in POST (not url encoded)');
	}
});


