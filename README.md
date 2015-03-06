==============
Mathoid-server
==============

Mathoid-server is a service that uses MathJax and PhantomJS to create SVGs and MathML on server side.
Mathoid-server is a based on svgtex - https://github.com/agrbin/svgtex.



Installation
------------
see http://formulasearchengine.com/mathoid


API Description
---------------

to be written

## Create a new release

Checkout the latest version and switch to the master branch:
* git-dch -R -N version
* git-buildpackage --git-tag -S

see also https://wikitech.wikimedia.org/wiki/Git-buildpackage

publish as ppa
* dput ppa:physikerwelt/mathoid ../version.changes


Testing
-------
Base service:

Start the service

```
$ phantomjs main.js &

loading bench page
server started on port 16000
you can hit server with http://localhost:16000/?2^n
.. or by sending latex source in POST (not url encoded)
```

run a test command

```
$ curl localhost:16000/?aa=a^2

aa=a^2.. 6B query, OK 2393B result, took 15ms.
{"tex":"aa=a^2","svg":"<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"width: 7.875ex; height: 2.125ex; vertical-align: -0.125ex; margin-top: 1px; margin-right: 0px; margin-bottom: 1px; margin-left: 0px; position: static; \" viewBox=\"0 -859.4768963737118 3397.6444800547624 898.0576086653176\" xmlns=\"http://www.w3.org/2000/svg\"><defs id=\"MathJax_SVG_glyphs\"><path id=\"MJMATHI-61\" stroke-width=\"10\" d=\"M33 157Q33 258 109 349T280 441Q331 441 370 392Q386 422 416 422Q429 422 439 414T449 394Q449 381 412 234T374 68Q374 43 381 35T402 26Q411 27 422 35Q443 55 463 131Q469 151 473 152Q475 153 483 153H487Q506 153 506 144Q506 138 501 117T481 63T449 13Q436 0 417 -8Q409 -10 393 -10Q359 -10 336 5T306 36L300 51Q299 52 296 50Q294 48 292 46Q233 -10 172 -10Q117 -10 75 30T33 157ZM351 328Q351 334 346 350T323 385T277 405Q242 405 210 374T160 293Q131 214 119 129Q119 126 119 118T118 106Q118 61 136 44T179 26Q217 26 254 59T298 110Q300 114 325 217T351 328Z\"></path><path id=\"MJMAIN-3D\" stroke-width=\"10\" d=\"M56 347Q56 360 70 367H707Q722 359 722 347Q722 336 708 328L390 327H72Q56 332 56 347ZM56 153Q56 168 72 173H708Q722 163 722 153Q722 140 707 133H70Q56 140 56 153Z\"></path><path id=\"MJMAIN-32\" stroke-width=\"10\" d=\"M109 429Q82 429 66 447T50 491Q50 562 103 614T235 666Q326 666 387 610T449 465Q449 422 429 383T381 315T301 241Q265 210 201 149L142 93L218 92Q375 92 385 97Q392 99 409 186V189H449V186Q448 183 436 95T421 3V0H50V19V31Q50 38 56 46T86 81Q115 113 136 137Q145 147 170 174T204 211T233 244T261 278T284 308T305 340T320 369T333 401T340 431T343 464Q343 527 309 573T212 619Q179 619 154 602T119 569T109 550Q109 549 114 549Q132 549 151 535T170 489Q170 464 154 447T109 429Z\"></path></defs><g stroke=\"black\" fill=\"black\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\"><use href=\"#MJMATHI-61\" xlink:href=\"#MJMATHI-61\"></use><use href=\"#MJMATHI-61\" x=\"534\" y=\"0\" xlink:href=\"#MJMATHI-61\"></use><use href=\"#MJMAIN-3D\" x=\"1345\" y=\"0\" xlink:href=\"#MJMAIN-3D\"></use><g transform=\"translate(2406,0)\"><use href=\"#MJMATHI-61\" xlink:href=\"#MJMATHI-61\"></use><use transform=\"scale(0.7071067811865476)\" href=\"#MJMAIN-32\" x=\"755\" y=\"513\" xlink:href=\"#MJMAIN-32\"></use></g></g></svg>","mml":"<math xmlns=\"http://www.w3.org/1998/Math/MathML\">\n  <mi>a</mi>\n  <mi>a</mi>\n  <mo>=</mo>\n  <msup>\n    <mi>a</mi>\n    <mn>2</mn>\n  </msup>\n</math>"}
```

AsciiMath
---------

```
$ curl -d 'type=asciimath&q=x^2 or a_(m n) or a_{m n} or (x+1)/y or sqrtx' localhost:10042
```
```

{"input":"x^2 or a_(m n) or a_{m n} or (x 1)/y or sqrtx","svg":"<svg xmlns:xlink=\"http://www.w3.org/1999/xlink\" style=\"width: 32.25ex; height: 5.375ex; vertical-align: -2.25ex; margin-top: 1px; margin-right: 0px; margin-bottom: 1px; margin-left: 0px; position: static; \" viewBox=\"-22 -1381.0887122916058 13904.782033342859 2301.6204245832114\" xmlns=\"http://www.w3.org/2000/svg\"><defs id=\"MathJax_SVG_glyphs\"><path id=\"STIXWEBMAINI-78\" stroke-width=\"10\" d=\"M243 355l12 -57c70 107 107 143 151 143c24 0 41 -15 41 -37c0 -21 -14 -36 -34 -36c-19 0 -28 17 -52 17c-18 0 -54 -44 -98 -121c0 -7 2 -21 8 -45l32 -134c7 -28 16 -41 30 -41c13 0 24 10 47 40c9 12 13 18 21 28l15 -9c-58 -90 -84 -114 -122 -114 c-32 0 -47 18 -59 68l-29 119l-88 -119c-44 -59 -64 -68 -95 -68s-50 16 -50 42c0 20 14 36 34 36c9 0 19 -4 32 -11c10 -6 20 -9 26 -9c11 0 30 19 51 49l82 116l-28 124c-14 60 -21 68 -46 68c-8 0 -20 -2 -39 -7l-18 -5l-3 16l11 4c61 22 94 29 117 29 c25 0 37 -18 51 -86Z\"></path><path id=\"STIXWEBMAIN-32\" stroke-width=\"10\" d=\"M474 137l-54 -137h-391v12l178 189c94 99 130 175 130 260c0 91 -54 141 -139 141c-72 0 -107 -32 -147 -130l-21 5c21 117 85 199 208 199c113 0 185 -77 185 -176c0 -79 -39 -154 -128 -248l-165 -176h234c42 0 63 11 96 67Z\"></path><path id=\"STIXWEBMAIN-6F\" stroke-width=\"10\" d=\"M470 231c0 -139 -90 -241 -225 -241c-121 0 -216 99 -216 238s90 232 225 232c122 0 216 -91 216 -229zM380 204c0 68 -18 137 -50 178c-24 30 -52 50 -95 50c-69 0 -116 -59 -116 -159c0 -79 16 -151 53 -205c22 -32 54 -50 90 -50c74 0 118 70 118 186Z\"></path><path id=\"STIXWEBMAIN-72\" stroke-width=\"10\" d=\"M160 458v-92c50 72 78 94 120 94c34 0 55 -20 55 -53c0 -28 -15 -45 -39 -45c-13 0 -24 5 -40 20c-11 10 -20 15 -26 15c-28 0 -70 -50 -70 -82v-225c0 -57 17 -72 85 -75v-15h-240v15c64 12 71 19 71 69v250c0 44 -9 60 -34 60c-12 0 -21 -1 -35 -4v16 c59 19 95 33 148 54Z\"></path><path id=\"STIXWEBMAINI-61\" stroke-width=\"10\" d=\"M463 111l13 -11c-75 -91 -99 -110 -139 -110c-28 0 -40 12 -40 41c0 25 2 33 23 115c-75 -113 -133 -157 -203 -157c-56 0 -100 40 -100 116c0 155 153 336 286 336c43 0 72 -21 80 -58l11 48l3 3l61 7l7 -3c-2 -9 -3 -11 -6 -21c-47 -171 -89 -343 -89 -363 c0 -7 6 -13 14 -13c9 0 22 8 52 41zM365 361c0 35 -21 58 -56 58c-45 0 -89 -31 -131 -92c-42 -63 -77 -152 -77 -215c0 -55 24 -74 60 -74c50 0 97 55 127 98c47 68 77 154 77 225Z\"></path><path id=\"STIXWEBMAINI-6D\" stroke-width=\"10\" d=\"M704 105l-5 -7c-53 -74 -97 -107 -144 -107c-26 0 -40 16 -40 46c0 10 3 27 13 66l58 227c5 20 7 33 7 38c0 12 -9 21 -20 21c-30 0 -81 -47 -131 -117c-49 -69 -69 -118 -108 -272h-75l27 93c44 152 68 258 68 271c0 16 -9 25 -22 25c-34 0 -93 -58 -149 -143 c-34 -52 -48 -88 -96 -246h-75l43 144c40 133 55 216 55 228c0 15 -14 22 -41 22h-25v16l162 31l3 -2l-58 -209c89 145 159 211 220 211c40 0 60 -24 60 -60c0 -19 -13 -75 -40 -152c70 111 111 161 160 192c24 15 43 20 63 20c37 0 58 -27 58 -63c0 -7 -2 -23 -3 -28 l-68 -251c-6 -23 -10 -41 -10 -45c0 -11 4 -16 12 -16c17 0 35 16 65 53l21 26Z\"></path><path id=\"STIXWEBMAINI-6E\" stroke-width=\"10\" d=\"M460 117l14 -13c-68 -93 -93 -113 -140 -113c-25 0 -47 16 -47 54c0 10 2 23 16 75l44 162c8 31 14 67 14 79c0 18 -9 29 -24 29c-40 0 -85 -49 -148 -142c-45 -67 -53 -90 -100 -248h-75l96 350c1 5 2 11 2 17c0 20 -14 26 -65 27v16c81 16 109 20 162 31l4 -2l-67 -218 c100 160 167 220 231 220c43 0 65 -25 65 -61c0 -18 -4 -39 -10 -60l-56 -203c-10 -36 -14 -53 -14 -61c0 -9 4 -18 16 -18c14 0 32 16 61 53c7 8 14 17 21 26Z\"></path><path id=\"STIXWEBMAIN-31\" stroke-width=\"10\" d=\"M394 0h-276v15c74 4 95 25 95 80v449c0 34 -9 49 -30 49c-10 0 -27 -5 -45 -12l-27 -10v14l179 91l9 -3v-597c0 -43 20 -61 95 -61v-15Z\"></path><path id=\"STIXWEBMAINI-79\" stroke-width=\"10\" d=\"M243 186l21 -110c85 141 122 213 122 257c0 14 -7 20 -26 32c-20 13 -26 23 -26 39c0 22 17 37 40 37c30 0 52 -25 52 -55c0 -57 -48 -167 -131 -305c-104 -172 -211 -287 -268 -287c-30 0 -51 17 -51 43c0 22 17 40 39 40c35 0 35 -28 61 -28c13 0 25 8 48 33 c18 19 63 78 71 91c6 12 10 24 10 35c0 40 -55 264 -82 332c-19 49 -37 64 -77 64c-11 0 -20 -1 -31 -4v17c11 2 22 4 32 6c20 4 53 10 107 18h4c15 0 68 -166 85 -255Z\"></path><path id=\"STIXWEBMAIN-221A\" stroke-width=\"10\" d=\"M963 973l-478 -1232h-32l-202 530c-17 45 -37 59 -62 59c-17 0 -43 -11 -65 -31l-12 20l156 124h19l204 -536h4l414 1066h54Z\"></path></defs><g stroke=\"black\" fill=\"black\" stroke-width=\"0\" transform=\"matrix(1 0 0 -1 0 0)\"><use href=\"#STIXWEBMAINI-78\" xlink:href=\"#STIXWEBMAINI-78\"></use><use transform=\"scale(0.7071067811865476)\" href=\"#STIXWEBMAIN-32\" x=\"640\" y=\"583\" xlink:href=\"#STIXWEBMAIN-32\"></use><g transform=\"translate(910,0)\"><g transform=\"translate(430,0)\"><use href=\"#STIXWEBMAIN-6F\" xlink:href=\"#STIXWEBMAIN-6F\"></use><use href=\"#STIXWEBMAIN-72\" x=\"505\" y=\"0\" xlink:href=\"#STIXWEBMAIN-72\"></use></g></g><g transform=\"translate(2614,0)\"><use href=\"#STIXWEBMAINI-61\" xlink:href=\"#STIXWEBMAINI-61\"></use><g transform=\"translate(506,-150)\"><use transform=\"scale(0.7071067811865476)\" href=\"#STIXWEBMAINI-6D\" xlink:href=\"#STIXWEBMAINI-6D\"></use><use transform=\"scale(0.7071067811865476)\" href=\"#STIXWEBMAINI-6E\" x=\"727\" y=\"0\" xlink:href=\"#STIXWEBMAINI-6E\"></use></g></g><g transform=\"translate(4091,0)\"><g transform=\"translate(430,0)\"><use href=\"#STIXWEBMAIN-6F\" xlink:href=\"#STIXWEBMAIN-6F\"></use><use href=\"#STIXWEBMAIN-72\" x=\"505\" y=\"0\" xlink:href=\"#STIXWEBMAIN-72\"></use></g></g><g transform=\"translate(5795,0)\"><use href=\"#STIXWEBMAINI-61\" xlink:href=\"#STIXWEBMAINI-61\"></use><g transform=\"translate(506,-150)\"><use transform=\"scale(0.7071067811865476)\" href=\"#STIXWEBMAINI-6D\" xlink:href=\"#STIXWEBMAINI-6D\"></use><use transform=\"scale(0.7071067811865476)\" href=\"#STIXWEBMAINI-6E\" x=\"727\" y=\"0\" xlink:href=\"#STIXWEBMAINI-6E\"></use></g></g><g transform=\"translate(7272,0)\"><g transform=\"translate(430,0)\"><use href=\"#STIXWEBMAIN-6F\" xlink:href=\"#STIXWEBMAIN-6F\"></use><use href=\"#STIXWEBMAIN-72\" x=\"505\" y=\"0\" xlink:href=\"#STIXWEBMAIN-72\"></use></g></g><g transform=\"translate(9263,0)\"><rect stroke=\"none\" width=\"1077\" height=\"60\" x=\"0\" y=\"220\"></rect><g transform=\"translate(60,676)\"><use href=\"#STIXWEBMAINI-78\" xlink:href=\"#STIXWEBMAINI-78\"></use><use href=\"#STIXWEBMAIN-31\" x=\"452\" y=\"0\" xlink:href=\"#STIXWEBMAIN-31\"></use></g><use href=\"#STIXWEBMAINI-79\" x=\"314\" y=\"-686\" xlink:href=\"#STIXWEBMAINI-79\"></use></g><g transform=\"translate(10627,0)\"><g transform=\"translate(597,0)\"><use href=\"#STIXWEBMAIN-6F\" xlink:href=\"#STIXWEBMAIN-6F\"></use><use href=\"#STIXWEBMAIN-72\" x=\"505\" y=\"0\" xlink:href=\"#STIXWEBMAIN-72\"></use></g></g><g transform=\"translate(12497,0)\"><use href=\"#STIXWEBMAIN-221A\" x=\"0\" y=\"-166\" xlink:href=\"#STIXWEBMAIN-221A\"></use><rect stroke=\"none\" width=\"452\" height=\"60\" x=\"933\" y=\"757\"></rect><use href=\"#STIXWEBMAINI-78\" x=\"933\" y=\"0\" xlink:href=\"#STIXWEBMAINI-78\"></use></g></g></svg>","mml":"<math xmlns=\"http://www.w3.org/1998/Math/MathML\">\n  <mstyle displaystyle=\"true\">\n    <msup>\n      <mi>x</mi>\n      <mn>2</mn>\n    </msup>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msub>\n      <mi>a</mi>\n      <mrow>\n        <mi>m</mi>\n        <mi>n</mi>\n      </mrow>\n    </msub>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msub>\n      <mi>a</mi>\n      <mrow>\n        <mi>m</mi>\n        <mi>n</mi>\n      </mrow>\n    </msub>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <mfrac>\n      <mrow>\n        <mi>x</mi>\n        <mn>1</mn>\n      </mrow>\n      <mi>y</mi>\n    </mfrac>\n    <mrow>\n      <mspace width=\"1ex\" />\n      <mtext>or</mtext>\n      <mspace width=\"1ex\" />\n    </mrow>\n    <msqrt>\n      <mi>x</mi>\n    </msqrt>\n  </mstyle>\n</math>","log":"0: x^2 or a_(m n) or a_{m n} or (.. 45B query, OK 6607B result, took 19ms.","success":true}i

Stability
---------

experimental.

Read https://github.com/agrbin/svgtex/wiki for more details!

Forked from https://github.com/agrbin/svgtex


# service-template-node [![Build Status](https://travis-ci.org/wikimedia/service-template-node.svg?branch=master)](https://travis-ci.org/wikimedia/service-template-node)

Template for creating MediaWiki Services in Node.js

# Getting Started

## Installation

First, clone the repository

```
git clone https://github.com/wikimedia/service-template-node.git
```

Install the dependencies

```
cd service-template-node
npm install
```

Finally, activate the development configuration file

```
ln -s config.dev.yaml config.yaml
```

You are now ready to get to work!

* Inspect/modify/configure `mathoid.js`
* Add routes by placing files in `routes/` (look at the files there for examples)

## Running the examples

The template is a fully-working example, so you may try it right away. To
start the server hosting the REST API, simply run (inside the repo's directory)

```
npm start
```

This starts an HTTP server listening on `localhost:6927`. There are several routes
you may query (with a browser, or `curl` and friends):

* `http://localhost:6927/_info/`
* `http://localhost:6927/_info/name`
* `http://localhost:6927/_info/version`
* `http://localhost:6927/_info/home`
* `http://localhost:6927/{domain}/v1/siteinfo{/prop}`
* `http://localhost:6927/{domain}/v1/page/{title}`
* `http://localhost:6927/{domain}/v1/page/{title}/lead`
* `http://localhost:6927/ex/err/array`
* `http://localhost:6927/ex/err/file`
* `http://localhost:6927/ex/err/manual/error`
* `http://localhost:6927/ex/err/manual/deny`
* `http://localhost:6927/ex/err/auth`

## Tests

The template also includes a test suite a small set of executable tests. To fire
them up, simply run:

```
npm test
```

If you haven't changed anything in the code (and you have a working Internet
connection), you should see all the tests passing. As testing most of the code
is an important aspect of service development, there is also a bundled tool
reporting the percentage of code covered. Start it with:

```
npm run-script coverage
```

## Troubleshooting

In a lot of cases when there is an issue with node it helps to recreate the `node_modules` directory:
```
rm -r node_modules
npm install
```

Enjoy!

