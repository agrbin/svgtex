render-math
===========

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
2015-03-26T16:20:05.602Z: Starting RenderMath, version 0.1: port = 16000, ...
2015-03-26T16:20:05.640Z: Server started on port 16000
Point your browser at http://localhost:16000 for a test form.
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

This is really two services in one:

1. When you provide it with a single formula in either LaTeX or MathML format, then 
  that formula will be rendered on the server, and the results will be returned as 
  a pure SVG resource.
2. When you provide it with a JATS file that contains one or more equations, then 
  all of the formulas will be extracted from that JATS file, and sent back to your 
  browser encapsulated in an HTML table. Your browser will then use MathJax to render 
  the formulas locally.


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

Note that MathML can be provided with a namespace prefix or without one. But,
if it is provided with a namespace prefix, then that prefix ***must be "mml:"***. 
No other namespace prefix will work.


Example files and testing
-------------------------

To see the command line options that are available when you start the service, enter

    phantomjs main.js --help

Example input files are included in the *examples* subdirectory. Metadata about these
examples is in the *examples.yaml* file.

Test files are in the *test* subdirectory.

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

By default, this loads MathJax from the MathJax CDN, with this URL:
*http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG*.

You could use the `--mathjax` command-line option to tell it to load MathJax from
some alternate location, or to use some alternate configuration file.  For example,
the following uses the same MathJax deployment as is used in PMC:

```
phantomjs main.js --mathjax=http://www.ncbi.nlm.nih.gov/core/mathjax/2.5/MathJax.js?\
config=http://www.ncbi.nlm.nih.gov/staff/maloneyc/mjconfig/mathjax-config-classic.3.4.1.js
```

[@FIXME: the above URL should be adjusted to use the URL of the released version of the config
file, once tex-with-mathjax is deployed.]


Release procedure
-----------------

* Test
* Update the version number in main.js
* Commit and tag the repository with the version number
* Push
* Deploy

Possible future enhancements
----------------------------

- Allow POST in other formats.  How about JSON?
- Implement uploading via "PMCID (from PMC3 by default or PMC3QA on selection)", and 
  have all of the math displayed on the page.

License and public domain notice
--------------------------------

Portions of this software from the original [agrbin/svgtex](https://github.com/agrbin/svgtex) project are
licensed under the MIT license, as described in LICENSE.txt.

Code that was added by government employees or contractors working for the
National Center for Biotechnology Information (NCBI) is released into the public
domain, as specified below.

> This software is a "United States Government Work" under the terms of the United States Copyright Act. It was written as part of the authors' official duties as United States Government employees and thus cannot be copyrighted. This software is freely available to the public for use. The National Library of Medicine and the U.S. Government have not placed any restriction on its use or reproduction.
>
> Although all reasonable efforts have been taken to ensure the accuracy and reliability of the software and data, the NLM and the U.S. Government do not and cannot warrant the performance or results that may be obtained by using this software or data. The NLM and the U.S. Government disclaim all warranties, express or implied, including warranties of performance, merchantability or fitness for any particular purpose.
> 
> Please cite NCBI in any work or product based on this material.

