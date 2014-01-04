svgtex
======

Using MathJax and PhantomJS to create SVGs on server side with minimum overhead.

MathJax is a great tool! Why not use it on a server side too?  To avoid loading the whole
phantomjs and MathJax into memory with every call, the service is exposed via HTTP.

Detailed usage instructions are on the [GitHub wiki](https://github.com/agrbin/svgtex/wiki).
For quick-start instructions, keep reading.

First download and extract MathJax into the `mathjax` subdirectory:

```
wget https://github.com/mathjax/MathJax/zipball/v2.3-latest -O mathjax.zip
unzip mathjax.zip
mv mathjax-MathJax-* mathjax
```

Then, start the server:

```
$ phantomjs main.js

Loading bench page
Server started on port 16000
You can hit the server with http://localhost:16000/?2^n
.. or by sending math source in POST (not url encoded).
```

And then (in a different console).. curl it up!

```
$ curl localhost:16000/?x

<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; ...
```

MathML example:

```
http://localhost:16000/?%3Cmath%3E%3Cmfrac%3E%3Cmi%3Ey%3C%2Fmi%3E%3Cmn%3E2%3C%2Fmn%3E%3C%2Fmfrac%3E%3C%2Fmath%3E
```


Loading MathJax from the CDN
----------------------------

The current implementation requires that MathJax be downloaded and installed locally,
because, as of the time of this writing (1/3/2013) the version on the CDN is broken, and
prevents MathML from working in PhantomJS, see
[https://github.com/mathjax/MathJax/issues/672](https://github.com/mathjax/MathJax/issues/672).
However, the latest .zip download has the fix.

When the fix is propogated to the CDN deployment, then we can change the [bench file](index.html)
to load it from there.


Stability
---------

Experimental.

Read https://github.com/agrbin/svgtex/wiki for more details!

