// perfect singleton
window.engine = (new (function() {

  this.Q = MathJax.Hub.queue;
  this.latex = null;
  this.mml = null;
  // FIXME:  I don't think buffer can tell the diff between latex and mml
  this.buffer = [];

  // bind helper.
  this.bind = function(method) {
    var engine = this;
    return function() {
      return method.apply(engine, arguments);
    };
  };

  // Initialize engine.
  // After MathJax is loaded:
  //   - this.latex will point to the LaTeX div and jax, and
  //   - this.mml will point to the MathML div and jax
  this._init = function() {
    this.Q.Push(this.bind(function () {
      this.latex = {
        div: document.getElementById("math-latex"),
        jax: MathJax.Hub.getAllJax("math-latex")[0]
      }
      this.mml = {
        div: document.getElementById("math-mml"),
        jax: MathJax.Hub.getAllJax("math-mml")[0]
      }
      this._process_buffered();
    }));
  };

  // Receives an input string and pushes a conversion job onto the MathJax
  // queue. MathJax, when it is finished conversion, will then invoke the next
  // function in the queue, which is the callback, that makes its way back to
  // the client in the response.
  this._process = function(src_type, src, cb) {
    this.Q.Push(["Text", this[src_type].jax, src]);
    this.Q.Push(this.bind(function() {
      cb(this[src_type].div.getElementsByTagName("svg")[0].cloneNode(true));
    }));
  };

  // This is a helper for merge, who will want to decide
  // whether something went wrong while rendering the math.
  // the constant #C00 could be overriden by config!!
  this._text_is_error = function(txt) {
    return txt.getAttribute("fill") == "#C00" &&
      txt.getAttribute("stroke") == "none";
  };

  // MathJax keeps parts of SVG symbols in one hidden svg at
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

  // If someone calls process() before init is complete,
  // that call will be stored into a buffer. After the init
  // is complete, all buffer stuff will get resolved.
  // FIXME:  need to test buffering, since the introduction of MML.
  this._process_buffered = function() {
    for (var i = 0; i < this.buffer.length; ++i) {
      this.process(this.buffer[i][0], this.buffer[i][1]);
    }
    this.buffer = [];
  };

  // When process() is finished, the callback cb will be invoked with an
  // array [<src string>, <svg out>].
  // If there is an error during the rendering then the second
  // element, instead of a string, will be a nested array with
  // one string element giving the error message.
  this.process = function(src_type, src, cb) {
    // For debugging, the console doesn't work from here, but you can return dummy
    // data, as follows.  It will show up in the browser instead of the real results.
    //cb([src, "query is '" + src + "'"]);

    if (this[src_type] === null || this[src_type].jax === null) {
      this.buffer.push( [src_type, src, cb] );
    }
    else {
      // bind() here (see "bind helper", above) just makes sure that `this`,
      // inside the function, continues to refer to this engine object.
      this._process(src_type, src, this.bind(function(svg) {
        cb([src, this._merge(svg)]);
      }));
    }
  };


  this._init();
}));
