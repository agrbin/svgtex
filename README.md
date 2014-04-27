svgtex
======

Using MathJax and PhantomJS to create SVGs on server side with minimum overhead.

This is just an idea, algorithm and it's proof of concept.
If you want to use such system in production, take a look at this fork too: https://github.com/gwicke/mathoid !

MathJax is a great tool! Why not use it on a server side too?  To avoid loading the whole
phantomjs and MathJax into memory with every call, the service is exposed via HTTP.

Detailed usage instructions are on the [GitHub wiki](https://github.com/agrbin/svgtex/wiki).
For quick-start instructions, keep reading.


Then, start the server:

```
$ phantomjs main.js

Loading bench page index.html
Server started on port 16000
Point your brownser at http://localhost:16000 for a test form.
```

Try it out by pointing your browser at http://localhost:16000/, and using the test form
to enter an equation in either TeX or MathML.

Or, from a different console, use curl:

```
$ curl localhost:16000/?q=x

<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; ...
```

Or, try this MathML example:
http://localhost:16000/?type=mml&q=%3Cmath%3E%3Cmfrac%3E%3Cmi%3Ey%3C%2Fmi%3E%3Cmn%3E2%3C%2Fmn%3E%3C%2Fmfrac%3E%3C%2Fmath%3E.


Loading MathJax from the CDN vs locally
---------------------------------------

By default, this loads MathJax from the [MathJax
CDN](http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_SVG).
That means that the server uses an internet connection, and it loads MathJax
once, as the server is started.

To use a local version of MathJax instead, first download and extract MathJax
into the `mathjax` subdirectory (or wherever else you would like):

```
wget https://github.com/mathjax/MathJax/zipball/v2.3-latest -O mathjax.zip
unzip mathjax.zip
mv mathjax-MathJax-* mathjax
```

Then uncomment the \<script> element in *index.html* that refers to this local version,
and comment out the one that loads from the CDN.


Stability
---------

Experimental.

Read https://github.com/agrbin/svgtex/wiki for more details!

