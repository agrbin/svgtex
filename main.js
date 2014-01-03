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


// Helper function to determine if a src string is latex or mathml
function latex_or_mml(src) {
  return src.match('^\\s*<\\s*math(\\s+|>)') ? 'mml' : 'latex';
}

// Parse the request and return an object with the parsed values.
// It will either have an error indication, e.g.
//   { status_code: 400, error: "message" }
// or a valid request, e.g.
//   { type: 'latex', src: 'n^2', width: '500' }

function parse_request(req) {
  if (req.method == 'GET') {
    var url = req.url;
    var iq = url.indexOf("?");
    if (iq == -1) {  // no query string
      return {
        status_code: 400,  // bad request
        error: "Missing query string"
      };
    }

    var qs = url.substr(iq+1);
    // If the query string does not have an equal sign, or if it starts with something
    // that doesn't look like a param name, then it is not parameterized
    if (qs.indexOf("=") == -1 || !qs.match('^[a-zA-Z]+=')) {
      var src = decodeURIComponent(qs);
      return {
        type: latex_or_mml(src),
        src: src
      }
    }
    else return parse_parameterized_request(qs);
  }

  else if (req.method == 'POST') {
    // If the post content does not have an equal sign, or if it starts with something
    // that doesn't look like a param name, then it is not parameterized (and, for
    // backward compatibility, we assume it is not URL encoded)
    var pr = req.postRaw;
    if (pr.indexOf("=") == -1 || !pr.match('^[a-zA-Z]+=')) {
      return {
        type: latex_or_mml(pr),
        src: pr
      }
    }
    else return parse_parameterized_request(pr);
  }

  else {  // method is not GET or POST
    return {
      status_code: 400,  // bad request
      error: "Method " + req.method + " not supported"
    }
  }
}

// Parse a parameterized request.  This must be properly URL encoded, including
// using %3D for any '=' that appears in an equation.  For example,
// ?latex=x%3Dy
function parse_parameterized_request(req_content) {
  var param_strings = req_content.split(/&/);
  var num_param_strings = param_strings.length;
  // default values:
  var parsed = {
    width: null
  };
  for (var i = 0; i < num_param_strings; ++i) {
    var ps = param_strings[i];
    var ie = ps.indexOf('=');
    if (ie == -1) {
      return {
        status_code: 400,
        error: "Can't decipher request parameter"
      }
    }
    var key = ps.substr(0, ie);
    var val = decodeURIComponent(ps.substr(ie+1));
    if (key == 'latex') {
      parsed.type = 'latex';
      parsed.src = val;
    }
    else if (key == 'mml') {
      parsed.type = 'mml';
      parsed.src = val;
    }
    else if (key == 'src') {
      parsed.type = latex_or_mml(val);
      parsed.src = val;
    }
    else if (key == 'width') {
      parsed.width = val;
    }
    else {
      return {
        status_code: 400,
        error: "Unrecognized parameter name"
      }
    }
  }
  return parsed;
}

console.log("loading bench page");
page.open('index.html', function (status) {

  // Set up the listener that will respond to every new request
  service = server.listen('0.0.0.0:' + PORT, function(req, resp) {
    console.log("Request received: " + req.method + " '" + req.url + "'");
    var query = parse_request(req);
    if (query.error) {
      console.log('Error:  ' + query.error);
      resp.statusCode = query.status_code;
      resp.write(query.error);
      resp.close();
      return;
    }

    activeRequests[query.src] = [resp, (new Date()).getTime()];

    // The following evaluates the function argument in the page's context,
    // with query -> _query. That, in turn, calls the process() function in
    // engine.js, which causes MathJax to render the math.  The callback is
    // PhantomJS's callPhantom() function, which in turn calls page.onCallback(),
    // above.  This just queues up the call, and will return at once.
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
    console.log("You can hit the server with http://localhost:" + PORT + "/?2^n");
    console.log(".. or by sending tex source in POST (not url encoded).");
  }
});


