// this script will set up a HTTP server on this port (local connections only)
// and will receive POST requests (not urlencoded)
var PORT = 16000;

// server will process this many queries and then exit. (-1, never stop).
var REQ_TO_LIVE = -1;

var server = require('webserver').create();
var page = require('webpage').create();
var activeRequests = {};
var service = null;

// communication from page and this script is done with callPhantom API
// https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage
page.onCallback = function(data) {
  var record = activeRequests[data[0]];
  var resp = record[0];
  var t = ', took ' + (((new Date()).getTime() - record[1])) + 'ms.';

  if ((typeof data[1]) === 'string') {
    resp.statusCode = 200;
    resp.setHeader("Content-Type", "image/svg+xml");
    resp.setHeader("Content-Length", data[1].length);
    resp.write(data[1]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, OK ' + data[1].length + 'B result' + t);
  } else {
    resp.statusCode = 400;
    resp.write(data[1][0]);
    console.log(data[0].substr(0, 30) + '.. ' +
        data[0].length + 'B query, ERR ' + data[1][0] + t);
  }
  resp.close();
  if (!(--REQ_TO_LIVE)) {
    phantom.exit();
  }
}

console.log("loading bench page");
page.open('index.html', function (status) {
  console.log("server started on port " + PORT);
  console.log("you can hit server with http://localhost:" + PORT + "/?2^n");
  console.log(".. or by sending latex source in POST (not url encoded)");
  service = server.listen('127.0.0.1:' + PORT, function(req, resp) {
    var query;
    if (req.method == 'GET') {
      // URL starts with /? and is urlencoded.
      query = unescape(req.url.substr(2));
    } else {
      query = req.postRaw;
    }
    activeRequests[query] = [resp, (new Date()).getTime()];
    // this is just queueing call, it will return at once.
    page.evaluate(function(q) {
      window.engine.process(q, window.callPhantom);
    }, query);
  });
});


