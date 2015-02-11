// perfect singleton
window.engine = (new (function() {

  this.Q = MathJax.Hub.queue;
  this.tex = null;
  this.mml = null;
  this.buffer = [];

MathJax.Hub.Config({
  displayAlign: "left",
  displayIndent:"3em",
  tex2jax: {
    preview: ["[math]"],
    processEscapes: true,
    ignoreClass: ['xis-eDocBody'],
    processClass: ['math'],
    inlineMath: [ ['$','$'], ["\\(","\\)"] ],
    displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
    skipTags: ["script","noscript","style","textarea","pre","code"]
  },
  TeX: {
    noUndefined: {disabled: true},
    Macros: {
      Argument: ['\\mmlToken{mtext}[mathvariant="sans-serif-italic"]{#1}',1],
      Code:     ['{\\mathtt{#1}}',1],
      Emph:     ['{\\mathit{#1}}', 1],
      Keyword:  ['{\\mathsf{\\mathbf{#1}}}', 1],
      Label:    ['{}', 1],
      Mathtext: ['{\\mathrm{#1}}',1],
      Procname: ['{}', 1],
      Quotes:   ['{#1}', 1],
      Squotes:  ['{#1}', 1],
      Strong:   ['{\\mathbf{#1}}',1],
      Variable: ['{\\mathsf{#1}}',1],
      bA:'{\\mathbf{A}}',
      bB:'{\\mathbf{B}}',
      bC:'{\\mathbf{C}}',
      bD:'{\\mathbf{D}}',
      bDelta:'\\boldsymbol{\\Delta}',
      bE:'{\\mathbf{E}}',
      bF:'{\\mathbf{F}}',
      bG:'{\\mathbf{G}}',
      bGamma:'\\boldsymbol{\\Gamma}',
      bH:'{\\mathbf{H}}',
      bI:'{\\mathbf{I}}',
      bJ:'{\\mathbf{J}}',
      bK:'{\\mathbf{K}}',
      bL:'{\\mathbf{L}}',
      bLambda:'\\boldsymbol{\\Lambda}',
      bM:'{\\mathbf{M}}',
      bN:'{\\mathbf{N}}',
      bO:'{\\mathbf{O}}',
      bOmega: '\\boldsymbol{\\Omega}',
      bP:'{\\mathbf{P}}',
      bPhi:'\\boldsymbol{\\Phi}',
      bPi:'\\boldsymbol{\\Pi}',
      bPsi:'\\boldsymbol{\\Psi}',
      bQ:'{\\mathbf{Q}}',
      bR:'{\\mathbf{R}}',
      bS:'{\\mathbf{S}}',
      bSigma: '\\boldsymbol{\\Sigma}',
      bT:'{\\mathbf{T}}',
      bTheta: '\\boldsymbol{\\Theta}',
      bU:'{\\mathbf{U}}',
      bUpsilon:'\\boldsymbol{\\Upsilon}',
      bV:'{\\mathbf{V}}',
      bW:'{\\mathbf{W}}',
      bX:'{\\mathbf{X}}',
      bXi:    '\\boldsymbol{\\Xi}',
      bY:'{\\mathbf{Y}}',
      bZ:'{\\mathbf{Z}}',
      balpha: '\\boldsymbol{\\alpha}',
      bbeta: '\\boldsymbol{\\beta}',
      bchi:   '\\boldsymbol{\\chi}',
      bdelta: '\\boldsymbol{\\delta}',
      bepsilon: '\\boldsymbol{\\epsilon}',
      bgamma: '\\boldsymbol{\\gamma}',
      big: ['{#1}',1],
      biota:  '\\boldsymbol{\\iota}',
      bkappa: '\\boldsymbol{\\kappa}',
      blambda:'\\boldsymbol{\\lambda}',
      bm: ['{\\boldsymbol{#1}}',1],
      bmu:    '\\boldsymbol{\\mu}',
      bnu:    '\\boldsymbol{\\nu}',
      bomega: '\\boldsymbol{\\omega}',
      bphi:   '\\boldsymbol{\\phi}',
      bpi:    '\\boldsymbol{\\pi}',
      bpsi:   '\\boldsymbol{\\psi}',
      brho:   '\\boldsymbol{\\rho}',
      bsigma: '\\boldsymbol{\\sigma}',
      btau:   '\\boldsymbol{\\tau}',
      btheta: '\\boldsymbol{\\theta}',
      bupsilon:'\\boldsymbol{\\upsilon}',
      bxi:    '\\boldsymbol{\\xi}',
      bzeta:  '\\boldsymbol{\\zeta}',
      emph: ['\\mathit{#1}', 1],
      hdots: '{\\ldots}',
      lefteqn: ["\\rlap{\\displaystyle{#1}}",1],
      mb:['{\\mathbf{#1}}',1],
      mbox: ['{\\text{#1}}',1],
      mc: ['{\\mathcal{#1}}',1],
      mi: ['{\\mathit{#1}}',1],
      mr: ['{\\mathrm{#1}}',1],
      ms: ['{\\mathsf{#1}}',1],
      mt: ['{\\mathtt{#1}}',1],
      rule: ['{}',2],
      slash:'/',
      textunderscore:'\\mathrm{\\_}',
      textup:   ['{\\mathrm{#1}}',1]
    }
  }
});









  // bind helper.
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

  // When process() is finished, the callback cb will be invoked with an
  // array [<q string>, <svg out>].
  // If there is an error during the rendering then the second
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

      if (t.last_q == q && t.last_width !== width) {
        this.Q.Push(["Rerender", jax]);
      }
      else if (t.last_q != q) {
        this.Q.Push(["Text", jax, q]);
      }
      t.last_q = q;
      t.last_width = width;

      this.Q.Push(this.bind(function() {
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

        cb([query.num, query.q, ret]);
      }));
    }
  };

  this._init();
}));
