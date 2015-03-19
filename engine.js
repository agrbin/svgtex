// Create and initialize the singleton engine object.

window.engine = (function() {

    var Q = MathJax.Hub.queue;
    var types = {
        tex: null,
        mml: null
    };
    var buffer = [];
    var error_message;


    // Initialize the engine. This is pushed onto the MathJax queue to make sure
    // it is called after MathJax initialization is done.
    var _init = function() {
        Q.Push(function () {
            types.tex = {
                div: document.getElementById("math-tex"),
                jax: MathJax.Hub.getAllJax("math-tex")[0],
                last_width: null,
                last_q: ''
            }
            types.mml = {
                div: document.getElementById("math-mml"),
                jax: MathJax.Hub.getAllJax("math-mml")[0],
                last_width: null,
                last_q: ''
            }
            _process_buffered();

            // Capture all error signals
            MathJax.Hub.signal.Interest(function(message) {
                if (message[0].match("TeX Jax")) {
                    error_message = message[0];
                }
            });
        });
    };

    // If someone calls process() before init is complete, that call will be stored into 
    // a buffer. After the init is complete, all buffered stuff will get resolved.
    var _process_buffered = function() {
        for (var i = 0; i < buffer.length; ++i) {
            process(buffer[i][0], buffer[i][1]);
        }
        buffer = [];
    };


    // FIXME: do we still need this?  It seems brittle.
    // This helper function determines whether or not a <text> node inside the SVG
    // output from MathJax is an error message.  It uses the default error message
    // fill color.  Note that the constant #C00 could be overriden by the MathJax
    // config!!
    var _text_is_error = function(txt) {
        return txt.getAttribute("fill") == "#C00" &&
               txt.getAttribute("stroke") == "none";
    };

    // Serialize an (svg) element
    var _serialize = function(svg) {
        var tmpDiv = document.createElement('div');
        tmpDiv.appendChild(svg);
        return tmpDiv.innerHTML;
    };

    // MathJax keeps parts of SVG symbols in one hidden svg at
    // the begining of the DOM, this function should take two
    // SVGs and return one stand-alone svg.
    var _merge_svgs = function(svg) {
        var origDefs = document.getElementById('MathJax_SVG_Hidden')
            .nextSibling.childNodes[0];
        var defs = origDefs.cloneNode(false);

        // append shallow defs and change xmlns.
        svg.insertBefore(defs, svg.childNodes[0]);
        svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");

        // clone and copy all used paths into local defs.
        // xlink:href in uses FIX
        var uses = svg.getElementsByTagName("use");
        for (var k = 0; k < uses.length; ++k) {
            var id = uses[k].getAttribute("href");
            defs.appendChild(
                document.getElementById(id.substr(1)).cloneNode(true)
            );
            if (uses[k]["href"] === undefined) {
                uses[k].setAttribute("xlink:href", id);
            }
        }

        svg.style.position = "static";
        return _serialize(svg);
    };


    // The process() function is called from main.js's listenLoop, when it gets
    // a request that requires MathJax.
    // When process() is finished, the callback cb will be invoked with an
    // array [<q string>, <svg out>]. That, in turn, causes the page's onCallback
    // function to be called (in main.js), which sends the response to the client.
    // If there is an error during the rendering, then the second
    // element, instead of a string, will be a nested array with
    // one string element giving the error message.
    var process = function(query, cb) {
        // For debugging, the console doesn't work from here, but you can return dummy
        // data, as follows.  It will show up in the browser instead of the real results.
        //cb([query.num, query.q, ["debug message"]]);
        //return;

        var t = types[query.type];
        if (typeof t === 'undefined') {
            cb([query.num, query.q, ["Invalid type: '" + query.type + "'"]]);
            return;
        }

        // If we get called too early, buffer the request
        if (t === null || t.jax === null) {
            buffer.push( [query, cb] );
            return;
        }

        var q = query.q,
            width = query.width,
            div = t.div,
            jax = t.jax;

        // Initialize, get ready to process the equation
        Q.Push(function() {
            if (width === null) {
                // Let's just use a default width of 1000 (arbitrary)
                div.setAttribute('style', 'width: 1000px');
            }
            else {
                div.setAttribute('style', 'width: ' + width + 'px');
            }
            // Clear any error message
            error_message = '';
        });

        // Possible dispositions:
        // - if q and width are the same as last time, no need to Rerender
        // - if q is the same, but width is not, then Rerender() (calling
        //   Text() does not work)
        // - if q is not the same, call Text()

        if (t.last_q == q && t.last_width !== width) {
            Q.Push(["Rerender", jax]);
        }
        else if (t.last_q != q) {
            Q.Push(["Text", jax, q]);
        }
        t.last_q = q;
        t.last_width = width;

        // Push a callback function onto the queue. This will get called after
        // everything else in the queue is done.
        Q.Push(function() {
            if (error_message) {
                ret = [error_message];
                cb([query.num, query.q, [error_message]]);
                return;
            }

            else {
                var svg_elem = div.getElementsByTagName("svg")[0];
                var ret = null;
                if (!svg_elem) {
                    ret = ['MathJax error'];
                }
                else {
                    var texts = svg_elem.getElementsByTagName("text");
                    for (var i = 0; i < texts.length; ++i) {
                        if (_text_is_error(texts[i])) {
                            ret = [texts[i].textContent];
                            break;
                        }
                    }
                }
                if (!ret) {    // no error
                    ret = _merge_svgs(svg_elem.cloneNode(true));
                }
            }

            cb([query.num, query.q, ret]);
        });
    };

    _init();

    // This sets the global window.engine object value; can be used for debugging
    // in a browser.
    return {
        Q: Q,
        types: types,
        buffer: buffer,
        error_message: error_message,
        _init: _init,
        _process_buffered: _process_buffered,
        _text_is_error: _text_is_error,
        _serialize: _serialize,
        _merge_svgs: _merge_svgs,
        process: process
    };
})();
