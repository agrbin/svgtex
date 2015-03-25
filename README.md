pmc-math-tool-2
===============

This tool was forked from 
[agrbin](https://github.com/agrbin)'s excellent [svgtex](https://github.com/agrbin/svgtex) 
tool.

It uses MathJax and PhantomJS to render mathematical formulas into SVGs, on the server,
with minimum overhead. It runs as an HTTP service, with a simple interface.

To run it, first, you'll need to install the main dependency:
[phantom.js](http://phantomjs.org/). The exact instructions will depend on the type
of machine you have, and it is quite easy -- follow the instructions on that site's
download page.

Next, clone this repository, and `cd` into the project directory.
Then, start the server:

```
$ phantomjs main.js
port = 16000, requests_to_serve = -1, bench_page = bench.html, debug = false

Loading bench page bench.html
Server started on port 16000
Point your brownser at http://localhost:16000 for a test form.
```

Try it out by pointing your browser at http://localhost:16000/, and using the test form
to enter an equation in either TeX or MathML. For example,

* TeX:  `n^2`
* MathML: `<math><mfrac><mi>y</mi><mn>2</mn></mfrac></math>`

You can use the test form to generate either GET or POST requests.

To access the service from a script, for example, you could use curl:

```
$ curl localhost:16000/?q=n%5E2
<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; ...

$ curl http://localhost:16000/?q=%3Cmath%3E%3Cmi%3EN%3C%2Fmi%3E%3C%2Fmath%3E
<svg xmlns:xlink="http://www.w3.org/1999/xlink" width="2.032ex" height="1.761ex" ...

$ curl http://localhost:16000 --data-urlencode "q=\\text{rate is }26\\%" > rate.svg
```

Two services in one
-------------------


Service API
-----------

Make requests to the service with either GET or POST. When making POST requests, the
parameters must be encoded as x-www-form-urlencoded.

The parameters this service understands are:

* `q` - The content of the math formula or JATS file
* `in-format` - One of 'latex', 'mml', 'jats', or 'auto'. The default is 'auto'.
* `latex-style` - If the input is a LaTeX formula, this specifies whether it should
  be rendered in text (inline) or display (block) mode
* `width` - Maximum width for the equations


Example files and testing
-------------------------

Example input files are included in the *examples* subdirectory. Metadata about these
examples is in the *examples.yaml* file.

The Perl script *test.pl* runs automated tests against the service, using tests defined
in the *tests.yaml* file. Most of those tests use the example files 
for the value of the `q` parameter (the main input).

During development or maintenance, you can test the processing engine by loading the
bench.html in a browser.  Then, send a LaTeX equation to the engine to process:

```
engine.process({q: 'n', 'in_format': 'latex'}, function(q, svg) {console.log(q, svg);});
```

Test the JATS parsing routines by loading parse_jats.html in a browser, and looking
at the JavaScript console. These routines are encapsulated in the parse_jats.js 
module.


Loading MathJax
---------------

By default, this loads MathJax from the NCBI servers, using the same version of
MathJax and the same configuration file as PMC.  The URL for this is in the
&lt;script> tag of the bench.html page.


