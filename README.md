svgtex
======

Using MathJax and PhantomJS to create SVGs on server side with minimum overhead.

MathJax is a great tool! Why not use it on a server side too?

To avoid loading whole phantomjs and MathJax into memory with every call the service is exposed via HTTP.

```
$ phantomjs main.js

loading bench page
server started on port 16000
you can hit server with http://localhost:16000/?2^n
.. or by sending latex source in POST (not url encoded)
```

And then (in a different console).. curl it up!

```
$ curl localhost:16000/?x

<svg xmlns:xlink="http://www.w3.org/1999/xlink" style="width: 1.34ex; height: 1.099ex; vertical-align: -0.124ex; margin-top: 1px; margin-right: 0px; margin-bottom: 1px; ...
```


CDN loading
-----------

Current implementation uses internet connection to load bench page (it loads the MathJax from CDN, only once, before server is started), this can be avoided by downloading mathjax into wokring dir and changing the index.html where it links with mathjax.

Stability
---------

experimental.
