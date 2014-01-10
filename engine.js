// perfect singleton
window.engine = (new (function() {

  this.Q = MathJax.Hub.queue;
  this.tex = null;
  this.mml = null;
  this.buffer = [];

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
      uses[k].setAttribute("xlink:href", id);
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

    // For testing, don't hit MathJax, just reply with a canned response every time:
    if (document.getElementById("echo_test")) {
      cb([query.num, query.q,
        '<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 2.25ex; height: 3.125ex; ' +
        'vertical-align: -1.125ex; margin-top: 1px; margin-right: 0px; margin-bottom: 1px; margi' +
        'n-left: 0px; position: static; " viewBox="0 -914.5670579355773 991.446355599587 1341.15' +
        '49311513259" xmlns="http://www.w3.org/2000/svg"><defs id="MathJax_SVG_glyphs"><path id=' +
        '"MJMAIN-31" stroke-width="10" d="M213 578L200 573Q186 568 160 563T102 556H83V602H102Q14' +
        '9 604 189 617T245 641T273 663Q275 666 285 666Q294 666 302 660V361L303 61Q310 54 315 52T' +
        '339 48T401 46H427V0H416Q395 3 257 3Q121 3 100 0H88V46H114Q136 46 152 46T177 47T193 50T2' +
        '01 52T207 57T213 61V578Z"></path><path id="MJMATHI-4E" stroke-width="10" d="M234 637Q23' +
        '1 637 226 637Q201 637 196 638T191 649Q191 676 202 682Q204 683 299 683Q376 683 387 683T4' +
        '01 677Q612 181 616 168L670 381Q723 592 723 606Q723 633 659 637Q635 637 635 648Q635 650 ' +
        '637 660Q641 676 643 679T653 683Q656 683 684 682T767 680Q817 680 843 681T873 682Q888 682' +
        ' 888 672Q888 650 880 642Q878 637 858 637Q787 633 769 597L620 7Q618 0 599 0Q585 0 582 2Q' +
        '579 5 453 305L326 604L261 344Q196 88 196 79Q201 46 268 46H278Q284 41 284 38T282 19Q278 ' +
        '6 272 0H259Q228 2 151 2Q123 2 100 2T63 2T46 1Q31 1 31 10Q31 14 34 26T39 40Q41 46 62 46Q' +
        '130 49 150 85Q154 91 221 362L289 634Q287 635 234 637Z"></path></defs><g stroke="black" ' +
        'fill="black" stroke-width="0" transform="matrix(1 0 0 -1 0 0)"><g transform="translate(' +
        '120,0)"><rect stroke="none" width="751" height="60" x="0" y="220"></rect><use transform' +
        '="scale(0.7071067811865476)" href="#MJMAIN-31" x="278" y="591" xlink:href="#MJMAIN-31">' +
        '</use><use transform="scale(0.7071067811865476)" href="#MJMATHI-4E" x="84" y="-568" xli' +
        'nk:href="#MJMATHI-4E"></use></g></g></svg>'
      ]);
      return;
    }


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
