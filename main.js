// this script will set up a HTTP server on this port (local connections only)
// and will receive POST requests (not urlencoded)
var PORT = parseInt(require('system').env.PORT) || 16000;

// server will process this many queries and then exit. (-1, never stop).
var REQ_TO_LIVE = -1;

var server = require('webserver').create();
var page = require('webpage').create();
var args = require('system').args;

// activeRequests holds information about any active MathJax requests.  It is
// a hash, with a sequential number as the key.  requestCount gets incremented
// for *every* HTTP request, but only requests that get passed to MathJax have an
// entry in activeRequests.  Each element of activeRequests
// is an array of [<response object>, <start time>].
var requestCount = 0;
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
// The argument, data, is an array that holds the three arguments from the
// process() function in engine.js:  the request number, the original
// text, and either the converted svg, or an array of one element
// that holds an error message.
page.onCallback = function(data) {
  var num = data[0],
      src = data[1],
      svg_or_error = data[2],
      record = activeRequests[num],
      resp = record[0],
      start_time = record[1],
      duration = (new Date()).getTime() - start_time,
      duration_msg = ', took ' + duration + 'ms.';

  if ((typeof svg_or_error) === 'string') {
    resp.statusCode = 200;
    resp.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
    resp.setHeader("Content-Length", utf8_strlen(svg_or_error));
    resp.write(svg_or_error);
    console.log(num + ': ' + src.substr(0, 30) + '.. ' +
        src.length + 'B query, OK ' + svg_or_error.length + 'B result' +
        duration_msg);
  }
  else {
    resp.statusCode = 400;    // bad request
    resp.write(svg_or_error[0]);
    console.log(num, src.substr(0, 30) + '.. ' +
        src.length + 'B query, error: ' + svg_or_error[0] + duration_msg);
  }
  resp.close();

  delete(activeRequests[num]);

  if (!(--REQ_TO_LIVE)) {
    phantom.exit();
  }
}


// Helper function to determine if a src string is tex or mathml
/*
function tex_or_mml(src) {
  return src.match('^\\s*<\\s*math(\\s+|>)') ? 'mml' : 'tex';
}
*/

// Parse the request and return an object with the parsed values.
// It will either have an error indication, e.g.
//   { num: 5, status_code: 400, error: "message" }
// or a valid request, e.g.
//   { num: 5, type: 'tex', q: 'n^2', width: '500' }

function parse_request(req) {
  // Set any defaults here:
  var query = {
    num: requestCount++,
    type: 'tex',
    width: null
  };

  var qs;   // will store the content of the (tex or mml) math
  if (req.method == 'GET') {
    var url = req.url;
    var iq = url.indexOf("?");
    if (iq == -1) {  // no query string
      query.status_code = 400;  // bad request
      query.error = "Missing query string";
      return query;
    }

    qs = url.substr(iq+1);
  }

  else if (req.method == 'POST') {
    qs = req.postRaw;
  }

  else {  // method is not GET or POST
    query.status_code = 400;  // bad request
    query.error = "Method " + req.method + " not supported";
    return query;
  }

  var param_strings = qs.split(/&/);
  var num_param_strings = param_strings.length;

  for (var i = 0; i < num_param_strings; ++i) {
    var ps = param_strings[i];
    var ie = ps.indexOf('=');
    if (ie == -1) {
      query.status_code = 400;  // bad request
      query.error = "Can't decipher request parameter";
      return query;
    }
    var key = ps.substr(0, ie);
    var val = decodeURIComponent(ps.substr(ie+1).replace(/\+/g, ' '));
    if (key == 'type') {
      query.type = val;
    }
    else if (key == 'mml') {
      query.type = 'mml';
      query.src = val;
    }
    else if (key == 'q') {
      query.q = val;
    }
    else if (key == 'width') {
      query.width = val;
    }
    else {
      query.status_code = 400;  // bad request
      query.error = "Unrecognized parameter name";
      return query;
    }
  }
  if (!query.q) {   // no source math
    query.status_code = 400;  // bad request
    query.error = "No source math detected in input";
    return query;
  }

  return query;
}

function listenLoop() {
  // Set up the listener that will respond to every new request
  service = server.listen('0.0.0.0:' + PORT, function(req, resp) {
    var query = parse_request(req);
    var request_num = query.num;
    console.log(request_num + ': ' + "received: " + req.method + " " +
        req.url.substr(0, 30) + " ..");
    if (query.error) {
      console.log(request_num + ": error: " + query.error);
      resp.statusCode = query.status_code;
      resp.write(query.error);
      resp.close();
      return;
    }

    // The following evaluates the function argument in the page's context,
    // with query -> _query. That, in turn, calls the process() function in
    // engine.js, which causes MathJax to render the math.  The callback is
    // PhantomJS's callPhantom() function, which in turn calls page.onCallback(),
    // above.  This just queues up the call, and will return at once.
    activeRequests[request_num] = [resp, (new Date()).getTime()];
    page.evaluate(function(_query) {
      window.engine.process(_query, window.callPhantom);
    }, query);
  });

  if (!service) {
    console.log("server failed to start on port " + PORT);
    phantom.exit(1);
  }
  else {
    console.log("Server started on port " + PORT);
    console.log("You can hit the server with http://localhost:" + PORT + "/?q=2^n");
    console.log(".. or by sending math source in POST.");
  }
}

console.log("Loading bench page");
page.open('index.html', listenLoop);

/* These includeJs calls would allow us to specify the MathJax location as a
   command-line parameter, but then you'd have to take the <script> tags out of
   index.html, and we'd lose the ability to debug by loading that in a browser
   directly.
page.open('index.html', function (status) {
  page.includeJs('mathjax/MathJax.js?config=TeX-AMS-MML_SVG', function() {
    page.includeJs('engine.js', listenLoop);
  });
});
*/


