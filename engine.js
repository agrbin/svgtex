// this file is called from index.html, in page loaded from the inside of
// phantomjs script.

// perfect singleton
window.engine = (new (function() {

  this.Q = MathJax.Hub.queue;
  this.math = null;
  this.buffer = [];

  // bind helper.
  this.bind = function(method) {
    var engine = this;
    return function() {
      return method.apply(engine, arguments);
    };
  };

  // initialize Engine, after MathJax is loaded, this.math will
  // point to our jax.
  this._init = function() {
    this.Q.Push(this.bind(function () {
      this.math = MathJax.Hub.getAllJax("math")[0];
      this._process_buffered();
    }));
  };

  // receives input latex string and invokes cb
  // function with svg result.
  this._process = function(latex, cb) {
    this.Q.Push(["Text", this.math, latex]);
    this.Q.Push(this.bind(function() {
      // then, this toSVG call will invoke cb(result).
      this.math.root.toSVG({
        appendChild : function(x) {cb(x);}
      });
    }));
  };

  // this is a helper for merge, who will want to decide
  // whether something went wrong while rendering latex.
  // the constant #C00 could be overriden by config!!
  this._text_is_error = function(txt) {
    return txt.getAttribute("fill") == "#C00" &&
      txt.getAttribute("stroke") == "none";
  };

  // mathjax keeps parts of SVG symbols in one hidden svg at
  // the begining of the DOM, this function should take two
  // SVGs and return one stand-alone svg which could be
  // displayed like an image on some different page.
  this._merge = function(svg) {
    var origDefs = document.getElementById('MathJax_SVG_Hidden')
      .nextSibling.childNodes[0];
    var defs = origDefs.cloneNode(false);

    // append shalow defs and change xmlns.
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
      uses[k].setAttribute("xlink:href", id);
    }

    // check for errors in svg.
    var texts = document.getElementsByTagName("text", svg);
    for (var i = 0; i < texts.length; ++i) {
      if (this._text_is_error(texts[i])) {
        return [texts[i].textContent];
      }
    }

    svg.style.position = "static";
    var tmpDiv = document.createElement('div');
    tmpDiv.appendChild(svg);
    return tmpDiv.innerHTML;
  };

  // if someone calls process before init is complete,
  // that call will be stored into buffer. After the init
  // is complete, all buffer stuff will get resolved.
  this._process_buffered = function() {
    for (var i = 0; i < this.buffer.length; ++i) {
      this.process(this.buffer[i][0], this.buffer[i][1]);
    }
    this.buffer = [];
  };

  // callback will be invoked with array [original latex, SVG output]
  // if there is an error during the latex rendering then second
  // element (instead of SVG output) will be array again with
  // only one string element describing the error message.
  this.process = function(latex, cb) {
    if (this.math === null) {
      this.buffer.push( [latex, cb] );
    } else {
      this._process(latex, this.bind(function(svg) {
        cb([latex, this._merge(svg)]);
      }));
    }
  };

  this._init();
}));
