// this script will set up a HTTP server on this port (local connections only)
// and will receive POST requests (not urlencoded)
var PORT = parseInt(require('system').env.PORT) || 16000;

// server will process this many queries and then exit. (-1, never stop).
var REQ_TO_LIVE = -1;

var server = require('webserver').create();
var page = require('webpage').create();
var args = require('system').args;
// FIXME:  I don't think it's good that this uses the original query data
// as the hash key.
var activeRequests = {};
var service = null;

if (args.length > 1) {
  PORT = args[1];
}

// thanks to:
// stackoverflow.com/questions/5515869/string-length-in-bytes-in-javascript
function utf8_strlen(str) {
  var m = encodeURIComponent(str).match(/%[89ABab]/g);
  return str.length + (m ? m.length : 0);
}

// This is the callback that gets invoked after the math has been converted.
// The argument, data, is an array that holds the two arguments from the
// process() function in engine.js.  The first element is the original
// text, the second is either the converted svg, or an array of one element
// that holds an error message.
page.onCallback = function(data) {
  console.log("page.onCallback");
  var record = activeRequests[data[0]];
  var resp = record[0];
  var t = ', took ' + (((new Date()).getTime() - record[1])) + 'ms.';

  if ((typeof data[1]) === 'string') {
    resp.statusCode = 200;
    resp.setHeader("Content-Type", "image/svg+xml");
    resp.setHeader("Content-Length", utf8_strlen(data[1]));
    resp.write(data[1]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, OK ' + data[1].length + 'B result' + t);
  }
  else {
    resp.statusCode = 400;    // bad request
    resp.write(data[1][0]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, error: ' + data[1][0] + t);
  }
  resp.close();
  // FIXME:  We should clean up activeRequests here.

  if (!(--REQ_TO_LIVE)) {
    phantom.exit();
  }
}


console.log("loading bench page");
page.open('index.html', function (status) {

  // Set up the listener that will respond to every new request
  service = server.listen('0.0.0.0:' + PORT, function(req, resp) {
    console.log("Request received: " + req.method + " '" + req.url + "'");
    var query;
    if (req.method == 'GET') {
      var url = req.url;
      var iq = url.indexOf("?");
      if (iq == -1) {  // no query string
        resp.statusCode = 400;    // bad request
        resp.write("Missing query string");
        console.log('Error:  Missing query string');
        resp.close();
        return;
      }
      query = decodeURIComponent(url.substr(iq+1));
    }
    else {
      query = req.postRaw;
    }
    // Is it LaTeX, or is it MathML?
    src_type = query.match('^\\s*<\\s*math(\\s+|>)') ? 'mml' : 'latex';

    activeRequests[query] = [resp, (new Date()).getTime()];

    // The following evaluates the function argument in the page's context,
    // with query -> q. That, in turn, calls the process_latex() function in
    // engine.js, which causes MathJax to render the math.  The callback is
    // PhantomJS's callPhantom() function, which in turn calls page.onCallback(),
    // above.
    // This just queues up the call, and will return at once.
    page.evaluate(function(q, st) {
      window.engine.process(st, q, window.callPhantom);
    }, query, src_type);
  });

  if (!service) {
    console.log("server failed to start on port " + PORT);
    phantom.exit(1);
  }
  else {
    console.log("Server started on port " + PORT);
    console.log("You can hit the server with http://localhost:" + PORT + "/?2^n");
    console.log(".. or by sending tex source in POST (not url encoded).");
  }
});


