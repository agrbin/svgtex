// This is the main phantomjs program that runs on the server. It loads the engine.html
// page inside the headless browser, and then starts up an HTTP service that listens for 
// requests.

// Version
var VERSION = '1.0';

var system = require('system');
var args = system.args;
var server = require('webserver').create();
var page = require('webpage').create();
var fs = require('fs');

var parse_jats = require('./parse_jats').parse_jats;


var usage =
  'Usage: phantomjs main.js [options]\n' +
  'Options:\n' +
  '  -h,--help            Print this usage message and exit\n' +
  '  -v,--version         Print the version number and exit\n' +
  '  -p,--port <port>     IP port on which to start the server\n' +
  '  -r,--requests <num>  Process this many requests and then exit.  -1 means \n' +
  '                       never stop.\n' +
  '  -m,--mathjax <url>   Use alternate URL to load MathJax; including the config file\n' +
  '  -d,--debug           Enable verbose debug messages\n';

var port = 16000;
var requests_to_serve = -1;
var engine_page = 'engine.html';    // engine page template, before $mathjax_url is substituted
var mathjax_url = 'http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG';
var debug = false;

// Parse command-line options.  This keeps track of which one we are on
var arg_num = 1;

// Helper function for option parsing.  Allow option/arg in any of
// these forms:
//    1: -p 1234
//    2: --po 1234
//    3: --po=1234
// Returns:
//    1 or 2: true
//    3:      '1234'
//    else:   false
function option_match(name, takes_optarg, arg) {
  var ieq = arg.indexOf('=');

  var arg_key;
  if (arg.substr(0, 2) == '--' && (takes_optarg && ieq != -1)) {  // form #3
    arg_key = arg.substring(2, ieq);
    if (name.substr(0, arg_key.length) == arg_key) {
      return arg.substr(ieq + 1);
    }
    return false;
  }

  if (arg.substr(0, 2) == '--') {
    arg_key = arg.substr(2);
  }
  else if (arg.substr(0, 1) == '-') {
    arg_key = arg.substr(1);
  }
  else {
    return false;
  }
  return name.substr(0, arg_key.length) == arg_key;
}

// This helper handles one option that takes an option-argument
function option_arg_parse(name) {
  var arg = args[arg_num];
  match = option_match(name, true, arg);
  if (!match) return false;

  if (typeof match != 'string') {
    if (arg_num + 1 < args.length) {
      arg_num++;
      match = args[arg_num];
    }
    else {
      phantom.exit(1);
    }
  }

  if (name == 'port') {
      port = match - 0;
  }
  else if (name == 'requests') { requests_to_serve = match - 0; }
  else if (name == 'mathjax') { mathjax_url = match; }

  arg_num++;
  return true;
}

var to_exit = false;
while (arg_num < args.length) {
  var arg = args[arg_num];

  if (option_match('help', false, arg)) {
    console.log(usage);
    phantom.exit(0);
    break;
  }

  if (option_match('version', false, arg)) {
    console.log('RenderMath version ' + VERSION);
    phantom.exit(0);
    break;
  }

  if (option_match('debug', false, arg)) {
    debug = true;
    arg_num++;
    continue;
  }

  if (option_arg_parse('port')) {
    continue;
  }
  if (option_arg_parse('requests')) {
    continue;
  }
  if (option_arg_parse('mathjax')) {
    continue;
  }

  console.error("Unrecognized argument: '" + arg + "'. Use '--help' for usage info.");
  phantom.exit(1);
  break;
}

log("Starting RenderMath, version " + VERSION + ": " +
    'port = ' + port + ", " +
    'requests_to_serve = ' + requests_to_serve + ", " +
    'mathjax_url = ' + mathjax_url + ", " +
    'debug = ' + debug
);


// activeRequests holds information about any active MathJax requests.  It is
// a hash, with a sequential number as the key.  request_num gets incremented
// for *every* HTTP request, but only requests that get passed to MathJax have an
// entry in activeRequests.  Each element of activeRequests
// is an array of [<response object>, <start time>].
var request_num = 0;
var activeRequests = {};

// This will hold the test HTML form, which is read once, the first time it is
// requested, from main.html.
var test_form_filename = 'main.html';
var test_form = null;

// Similarly, this will hold the client template HTML file.  But this is read right
// away, on startup.  client_template will either be null, or an object with 'start'
// and 'end' keys.
var client_template_filename = 'client-template.html';
var client_template = (function() {
  if (fs.isReadable(client_template_filename)) {
    return fs.read(client_template_filename);
  }
  else {
    console.error("Can't find " + client_template_filename + " ... " +
                  "client rendering will be disabled.");
    return null;
  }
})();

var service = null;

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
    log(num + ': ' + src.substr(0, 30) + '.. ' +
        src.length + 'B query, OK ' + svg_or_error.length + 'B result' +
        duration_msg);
    if (debug) {
      console.log("  svg: " + svg_or_error);
    }
  }
  else {
    resp.statusCode = 400;    // bad request
    resp.setHeader("Content-Type", "text/plain; charset=utf-8");
    resp.write(svg_or_error[0]);
    log(num, src.substr(0, 30) + '.. ' +
        src.length + 'B query, error: ' + svg_or_error[0] + duration_msg);
  }
  resp.close();

  delete(activeRequests[num]);

  if (!(--requests_to_serve)) {
    phantom.exit();
  }
}


// Parse the request and return an object with the parsed values.
// It will either have an error indication, e.g.
//   { num: 5, status_code: 400, error: "message" }
// or indicate that the test form should be returned, e.g.
//   { num: 5, test_form: 1 }
// or a static file:
//   { num: 5, static_file: 'examples/examples.yaml' }
// or a valid request, e.g.
//   { num: 5, in_format: 'latex', latex_style: 'text', q: 'n^2', width: '500' }
//   { num: 5, in_format: 'mml', q: '<math>...</math>', width: '500' }
//   { num: 5, in_format: 'jats', 
//     q: [{id: 'M1', format: 'latex', latex_style: 'display', q: 'n^2'}, {...}], width: '500' }

function parse_request(req) {
  // Set any defaults here:
  var query = {
    num: request_num++,
    in_format: 'auto',
    width: null
  };


  if (debug) {
    if (req.method == 'POST') {
      console.log("  req.postRaw = '" + req.postRaw + "'");
      //console.log("  req.post.q = '" + req.post.q + "'");
    }
    else {
      console.log("  req.url = '" + req.url + "'");
    }
  }


  var qs;   // query string, or x-www-form-urlencoded post data
  if (req.method == 'GET') {
    var url = req.url;

    // Implement the test form
    if (url == '' || url == '/') {
      if (test_form == null && fs.isReadable(test_form_filename)) {
        var t = fs.read(test_form_filename);  // set the global variable
        test_form = t.replace("<!-- version -->", VERSION);
      }
      if (test_form != null) {
        query.test_form = 1;
      }
      else {
        query.status_code = 500;  // Internal server error
        query.error = "Can't find test form";
      }
      return query;
    }

    // Static pages must start with '/examples/' or '/resources/'
    if (url.substr(0, 10) == '/examples/' || url.substr(0, 11) == '/resources/') {
      var static_file = url.substr(1);
      query.static_file = static_file;
      return query;
    }

    var iq = url.indexOf("?");
    if (iq == -1) {  // no query string
      query.status_code = 400;  // bad request
      query.error = "Missing query string";
      return query;
    }

    qs = url.substr(iq+1);
  }

  else if (req.method == 'POST') {
    if (typeof req.postRaw !== 'string') {   // which can happen
      query.status_code = 400;  // bad request
      query.error = "Missing post content";
      return query;
    }
    qs = req.postRaw;
  }

  else {  // method is not GET or POST
    query.status_code = 400;  // bad request
    query.error = "Method " + req.method + " not supported";
    return query;
  }

  var param_strings = qs.split(/&/);
  var num_param_strings = param_strings.length;
  if (num_param_strings == 1 && param_strings[0] == '') {
    num_param_strings = 0;
  }

  for (var i = 0; i < num_param_strings; ++i) {
    var ps = param_strings[i];
    var ie = ps.indexOf('=');
    if (ie == -1) {
      query.status_code = 400;  // bad request
      query.error = "Can't decipher request parameter";
      return query;
    }
    var key = ps.substr(0, ie);
    try {
      var val = decodeURIComponent(ps.substr(ie+1).replace(/\+/g, ' '));
    }
    catch (e) {
      query.status_code = 400;  // bad request
      query.error = "Request data not properly URI-encoded";
      return query;
    }
    if (key == 'in-format') {
      if (val != 'auto' && val != 'mml' && val != 'latex' && val != 'jats') {
        query.status_code = 400;  // bad request
        query.error = "Invalid value for in-format: " + val;
        return query;
      }
      query.in_format = val;
    }
    else if (key == 'q') {
      query.q = val;
    }
    else if (key == 'width') {
      // empty string means that no max width was specified
      if (val != '') {
        var w = parseInt(val);
        if (isNaN(w) || w <= 0) {
          query.status_code = 400;  // bad request
          query.error = "Invalid value for width: " + val;
          return query;
        }
        query.width = w;
      }
    }
    else if (key == 'file') { // file name, discard
    }
    else if (key == 'latex-style') {
      if (val != "text" && val != "display") {
        query.status_code = 400;  // bad request
        query.error = "Invalid value for latex-style: " + val;
        return query;
      }
      query.latex_style = val;
    }
    else {
      query.status_code = 400;  // bad request
      query.error = "Unrecognized parameter name: " + key;
      return query;
    }
  }

  if (!query.q || query.q.match(/^\s*$/)) {   // no source math
    query.status_code = 400;  // bad request
    query.error = "No source math detected in input";
    return query;
  }


  // Implement auto-detect.
  var q = query.q;
  if (query.in_format == 'auto') {
    // We assume that any XML tag that has the name 'math',
    // regardless of whether or not it is in a namespace, is mathml.
    // Also look for the opening tag '<article', to determine whether or not this is 
    // JATS.  If it's not JATS, and there are no MathML opening tags, then assume it
    // is LaTeX.
    var jats_stag = new RegExp('<article\\s+');
    var mml_stag = new RegExp('<([A-Za-z_]+:)?math', 'm');
    query.in_format = q.match(jats_stag) ? 'jats' :
                      q.match(mml_stag) ? 'mml' : 'latex';
  }


  // Parse JATS files
  if (query.in_format == 'jats') {
    var jats_formulas = parse_jats(q);

    if (typeof jats_formulas === "string") {
      query.status_code = 400;
      query.error = jats_formulas;
      return query;
    }
    query.q = jats_formulas;
  }

  return query;
}



// This function is called back from page.open, below, after the engine page
// has loaded.  It sets up the service listener that will respond to every new request.

function listenLoop(engine_status) {
  if (engine_status == "fail") {
    console.error("Engine page failed to load.");
    phantom.exit(1);
  }

  service = server.listen('0.0.0.0:' + port, function(req, resp) {
    try {
      var query = parse_request(req);
      var request_num = query.num;
      log(request_num + ': ' + 
          "received: " + req.method + " " +
          req.url.substr(0, 70) + (req.url.length > 70 ? "..." : ""));
      resp.setHeader("X-XSS-Protection", 0);


      //console.log("---------------------------------------------\n");
      //console.log("typeof query.q == " + typeof query.q);
      //console.log("---------------------------------------------\n");

      if (query.error) {
        log(request_num + ": error: " + query.error);
        resp.statusCode = query.status_code;
        resp.setHeader('Content-type', 'text/plain; charset=utf-8');
        resp.write(query.error);
        resp.close();
      }
      else if (query.test_form) {
        log(request_num + ": returning test form");
        /*
          console.log("resp.headers = {");
          for (var k in resp.headers) {
            if (resp.headers.hasOwnProperty(k)) {
              console.log("  '" + k + "': '" + resp.headers[k] + "'");
            }
          }
          console.log("}");
        */
        resp.setHeader('Content-type', 'text/html; charset=utf-8');
        resp.write(test_form);
        resp.close();
      }
      else if (query.static_file) {
        var static_file = query.static_file;

        var read_error = false;
        try {
          var file_contents = fs.read(static_file);
        }
        catch(e) {
          var errmsg = e;
          log(request_num + ": " + errmsg);
          resp.statusCode = 404;
          resp.setHeader('Content-type', 'text/plain; charset=utf-8');
          resp.write(errmsg);
          read_error = true;
        }

        if (!read_error) {
          log(request_num + ": returning " + static_file);

          // I was going to set a content-type, depending on extension, for all of the
          // examples. But, the test page works better if we always use 'text/plain', because
          // (for example) we don't have to worry about the browser trying to parse known-bad
          // examples.
          var extension = static_file.replace(/.*\.(.*)/, "$1");
          var media_types = {
            'js': 'application/javascript; charset=utf-8',
            'html': 'text/html; charset=utf-8'
          //  'latex': 'application/x-tex; charset=utf-8',
          //  'mml': 'application/mathml+xml; charset=utf-8',
          //  'nxml': 'application/jats+xml; charset=utf-8'
          };
          var media_type = media_types[extension] ? media_types[extension] 
                                                  : 'text/plain; charset=utf-8';
          resp.setHeader('Content-type', media_type);

          resp.write(file_contents);
        }

        resp.close();
      }

      else if (query.in_format == 'jats') {
        client_table(resp, query);
      }

      else {
        // We need to send the contents to MathJax.
        // The following evaluates the function argument in the engine page's context,
        // with query -> _query. That, in turn, calls the process() function in
        // engine.js, which causes MathJax to render the math.  The callback is
        // PhantomJS's callPhantom() function, which in turn calls page.onCallback(),
        // above.  This just queues up the call, and will return at once.

        // Implement latex_style here
        if (query.in_format == 'latex' && query.latex_style == 'display') {
          query.q = '\\displaystyle{' + query.q + '}';
        }
        log(request_num + ": sending to MathJax");
        activeRequests[request_num] = [resp, (new Date()).getTime()];
        page.evaluate(function(_query) {
          window.engine.process(_query, window.callPhantom);
        }, query);
      }
    }
    catch(e) {
      var errmsg = "Unknown server error: " + e;
      resp.statusCode = 500;
      resp.setHeader('Content-type', 'text/plain; charset=utf-8');
      resp.write(e);
      resp.close();
    }
  });

  if (!service) {
    console.log("server failed to start on port " + port);
    phantom.exit(1);
  }
  else {
    log("Server started on port " + port);
    console.log("Point your browser at http://localhost:" + port + " for a test form.");
  }
}

// Return an HTML page with a table of equations, for rendering on the client
function client_table(resp, query) {
  log(query.num + ": returning client template");
  var formulas = query.q;
  var width = query.width || null;

  resp_page = client_template.replace("$mathjax_url", mathjax_url);

  var rows = '';
  formulas.forEach(function(f) {
      rows += make_row(f, width);
  });
  resp_page = resp_page.replace("<!-- rows -->", rows);

  var sources = '';
  formulas.forEach(function(f) {
      sources += make_source(f);
  });
  resp_page = resp_page.replace("<!-- sources -->", sources);

  
  //var resp_page = client_template.start + rows + client_template.end;
  resp.setHeader('Content-type', 'text/html; charset=utf-8');
  resp.write(resp_page);
  resp.close();
}

// Make one row of the table 
function make_row(f, width) {
  var format = f.format == 'mml' ? "MathML" : "LaTeX, " + f.latex_style;

  var formula = f.format == 'mml' ? '<math />' :
                f.latex_style == 'text' ? '\\(\\)'
                                        : '\\[\\]';

  var formula_cell = width ?
      "<div id='" + f.id + "-div' style='width: " + width + "px;'>" + formula + "</div>" :
      "<div id='" + f.id + "-div'>" + formula + "</div>";

  return "<tr>\n" +
         "  <td>" + f.id + "</td>\n" +
         "  <td>" + format + "</td>\n" +
         "  <td>" + formula_cell + "</td>\n" +
         "</tr>\n";
}

function make_source(f) {
  return "<div data-rid='" + f.id + "-div' data-format='" + f.format + "'>" + 
         xml_escape(f.q) +
         "</div>\n";
}

function xml_escape(s) {
  return s.replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/'/g, "&apos;")
          .replace(/"/g, "&quot;");
}

function log(msg) {
  console.log((new Date()).toISOString() + ": " + msg);
}


// Read the engine page in, substitute the mathjax_url

if (fs.isReadable(engine_page)) {
  var engine_str = fs.read(engine_page);
}
else {
  console.error("Can't find " + engine_page);
  phantom.exit(1);
}
engine_str = engine_str.replace("$mathjax_url", mathjax_url);

// Open the web page. Once loaded, it will invoke listenLoop.
page.onLoadFinished = listenLoop;
page.setContent(engine_str, "file://" + fs.absolute(".") + "/engine.html");




/* These includeJs calls would allow us to specify the MathJax location as a
   command-line parameter, but then you'd have to take the <script> tags out of
   engine.html, and we'd lose the ability to debug by loading that in a browser
   directly.
page.open('engine.html', function (status) {
  page.includeJs('mathjax/MathJax.js?config=TeX-AMS-MML_SVG', function() {
    page.includeJs('engine.js', listenLoop);
  });
});
*/


