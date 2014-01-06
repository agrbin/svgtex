svgtex
======

Using MathJax and PhantomJS to create SVGs on server side with minimum overhead.

MathJax is a great tool! Why not use it on a server side too?  To avoid loading the whole
phantomjs and MathJax into memory with every call, the service is exposed via HTTP.

Detailed usage instructions are on the [GitHub wiki](https://github.com/agrbin/svgtex/wiki).
For quick-start instructions, keep reading.


Then, start the server:

```
$ phantomjs main.js

Loading bench page
Server started on port 16000
You can hit the server with http://localhost:16000/?q=2^n
.. or by sending math source in POST.
```

And then (in a different console).. curl it up!

```
$ curl localhost:16000/?q=x

<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; ...
```

MathML example:

```
http://localhost:16000/?type=mml&q=%3Cmath%3E%3Cmfrac%3E%3Cmi%3Ey%3C%2Fmi%3E%3Cmn%3E2%3C%2Fmn%3E%3C%2Fmfrac%3E%3C%2Fmath%3E
```


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

