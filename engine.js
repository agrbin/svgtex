// perfect singleton
window.engine = (new (function() {

	this.Q = MathJax.Hub.queue;
	this.math = null;
	this.buffer = [];

	function toMathML(jax,callback) {
		var mml;
		try {
			mml = jax.root.toMathML('');
		} catch(err) {
			if (!err.restart) {throw err;} // an actual error
			return MathJax.Callback.After([toMathML,jax,callback],err.restart);
		}
		MathJax.Callback(callback)(mml);
	}

	// bind helper.
	this.bind = function(method) {
		var engine = this;
		return function() {
			return method.apply(engine, arguments);
		};
	};

	// initialize Engine, after MathJax is loaded, this.math will
	// point to our jax.
	this.init = function() {
		this.Q.Push(this.bind(function () {
			this.math = MathJax.Hub.getAllJax('math')[0];
			this.processBuffered();
		}));
	};

	// receives input latex string and invokes cb
	// function with svg result.
	this.processCB = function(latex, cb) {
		this.Q.Push(['Text', this.math, latex]);
		this.Q.Push(this.bind(function() {
			// then, this toSVG call will invoke cb(result).
			cb(document.getElementsByTagName('svg')[1].cloneNode(true));
		}));
	};

	// this is a helper for merge, who will want to decide
	// whether something went wrong while rendering latex.
	// the constant #C00 could be overriden by config!!
	this.TextIsError = function(txt) {
		return txt.getAttribute('fill') === '#C00' &&
			txt.getAttribute('stroke') === 'none';
	};

	// mathjax keeps parts of SVG symbols in one hidden svg at
	// the begining of the DOM, this function should take two
	// SVGs and return one stand-alone svg which could be
	// displayed like an image on some different page.
	this.merge = function(svg) {
		var uses,
			copied = {},
			k,
			id,
			texts,
			i,
			tmpDiv,
			defs = document.getElementById('MathJax_SVG_Hidden')
			.nextSibling.childNodes[0].cloneNode(false);

		// clone and copy all used paths into local defs.
		// xlink:href in uses FIX
		uses = svg.getElementsByTagName('use');
		for ( k = 0; k < uses.length; ++k) {
			id = uses[k].getAttribute('href');
			if (id && copied[id]) {
				uses[k].setAttribute('xlink:href', id);
				// Already copied, skip
				continue;
			}
			defs.appendChild(
					document.getElementById(id.substr(1)).cloneNode(true)
					);
			uses[k].setAttribute('xlink:href', id);
			copied[id] = true;
		}

		// check for errors in svg.
		texts = document.getElementsByTagName('text', svg);
		for ( i = 0; i < texts.length; ++i) {
			if (this.TextIsError(texts[i])) {
				return [texts[i].textContent];
			}
		}

		svg.style.position = 'static';
		svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
		tmpDiv = document.createElement('div');
		tmpDiv.appendChild(svg);
		svg.insertBefore(defs, svg.firstChild);
		return tmpDiv.innerHTML;
	};

	// if someone calls process before init is complete,
	// that call will be stored into buffer. After the init
	// is complete, all buffer stuff will get resolved.
	this.processBuffered = function() {
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
			try{
				this.processCB(latex, this.bind(function( ) {
					var jax = MathJax.Hub.getAllJax(),
						mergedSVG = this.merge(document.getElementsByTagName('svg')[1].cloneNode(true));
					toMathML(jax[0],function (mml) {
						cb([latex, mergedSVG, mml]);
					});
				}));
			} catch (err) {
				cb([latex, err, err]);
			}
		}
	};

	this.init();
})());
