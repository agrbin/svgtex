// Perfect singleton.
// JavaScript refresher: the `new` keyword here causes a new object to be created,
// and then the anonymous function to be called as a *constructor*, with the `this`
// keyword referring to the new object.

window.engine = (new (function() {

  this.Q = MathJax.Hub.queue;
  this.tex = null;
  this.mml = null;
  this.buffer = [];

  // bind helper -- this just makes sure that `this` refers to the same thing
  // (the *engine*) in every function defined here.
  this.bind = function(method) {
    var engine = this;
    return function() {
      return method.apply(engine, arguments);
    };
  };

  // Initialize engine.
  this._init = function() {
    this.Q.Push(this.bind(function () {
      this.tex = {
        div: document.getElementById("math-tex"),
        jax: MathJax.Hub.getAllJax("math-tex")[0],
        last_width: null,
        last_q: ''
      }
      this.mml = {
        div: document.getElementById("math-mml"),
        jax: MathJax.Hub.getAllJax("math-mml")[0],
        last_width: null,
        last_q: ''
      }
      this._process_buffered();

      // Capture all error signals
      MathJax.Hub.signal.Interest(this.bind(function(message) {
        if (message[0].match("TeX Jax")) {
          this.error_message = message[0];
        }
      }));
    }));
  };

  // This helper function determines whether or not a <text> node inside the SVG
  // output from MathJax is an error message.  It uses the default error message
  // fill color.  Note that the constant #C00 could be overriden by the MathJax
  // config!!
  this._text_is_error = function(txt) {
    return txt.getAttribute("fill") == "#C00" &&
      txt.getAttribute("stroke") == "none";
  };

  // Serialize an (svg) element
  this._serialize = function(svg) {
    var tmpDiv = document.createElement('div');
    tmpDiv.appendChild(svg);
    return tmpDiv.innerHTML;
  };

  // MathJax keeps parts of SVG symbols in one hidden svg at
  // the begining of the DOM, this function should take two
  // SVGs and return one stand-alone svg which could be
  // displayed like an image on some different page.
  this._merge = function(svg) {
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
    return this._serialize(svg);
  };

  // If someone calls process() before init is complete,
  // that call will be stored into a buffer. After the init
  // is complete, all buffer stuff will get resolved.
  this._process_buffered = function() {
    for (var i = 0; i < this.buffer.length; ++i) {
      this.process(this.buffer[i][0], this.buffer[i][1]);
    }
    this.buffer = [];
  };


  // The process() function is called from main.js's listenLoop, when it gets
  // a request that requires MathJax.
  // When process() is finished, the callback cb will be invoked with an
  // array [<q string>, <svg out>]. That, in turn, causes the page's onCallback
  // function to be called (in main.js), which sends the response to the client.
  // If there is an error during the rendering, then the second
  // element, instead of a string, will be a nested array with
  // one string element giving the error message.
  this.process = function(query, cb) {
    // For debugging, the console doesn't work from here, but you can return dummy
    // data, as follows.  It will show up in the browser instead of the real results.
    //cb([query.num, query.q, ["debug message"]]);
    //return;

    var type = query.type;
    if (this[type] === null || this[type].jax === null) {
      this.buffer.push( [query, cb] );
    }
    else {

      var q = query.q,
          width = query.width,
          t = this[type],
          div = t.div,
          jax = t.jax;

      if (width === null) {
        //div.removeAttribute('style');
        // Let's just use a default width of 1000 (arbitrary)
        div.setAttribute('style', 'width: 1000px');
      }
      else {
        div.setAttribute('style', 'width: ' + width + 'px');
      }

      // Possibilities:
      // - if q and width are the same as last time, no need to Rerender
      // - if q is the same, but width is not, then Rerender() (calling
      //   Text() does not work)
      // - if q is not the same, call Text()
      this.Q.Push(this.bind(function() {
        this.error_message = '';
      }));

      if (t.last_q == q && t.last_width !== width) {
        this.Q.Push(["Rerender", jax]);
      }
      else if (t.last_q != q) {
        this.Q.Push(["Text", jax, q]);
      }
      t.last_q = q;
      t.last_width = width;

      // Push a callback function onto the queue. This will get called after
      // everything else in the queue is done.
      this.Q.Push(this.bind(function() {
        if (this.error_message) {
          ret = [this.error_message];
          cb([query.num, query.q, [this.error_message]]);
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
              if (this._text_is_error(texts[i])) {
                ret = [texts[i].textContent];
                break;
              }
            }
          }
          if (!ret) {    // no error
            ret = this._merge(svg_elem.cloneNode(true));
          }
        }

        cb([query.num, query.q, ret]);
      }));
    }
  };

  this._init();
}));
