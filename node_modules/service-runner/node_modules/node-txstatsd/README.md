# node-txstatsd

Modified version of https://github.com/sivy/node-statsd/ for WMF specific
txstatsd constraints. We've removed increment/decrement and nullified the sets
function if operating in txstatsd mode.

