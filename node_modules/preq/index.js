"use strict";

var P = require('bluebird');

// many concurrent connections to the same host
var Agent = require('./http_agent.js').Agent,
    httpAgent = new Agent({
        connectTimeout: 5 * 1000,
        // Setting this too high (especially 'Infinity') leads to high
        // (hundreds of mb) memory usage in the agent under sustained request
        // workloads. 250 should be a reasonable upper bound for practical
        // applications.
        maxSockets: 250
    });
require('http').globalAgent = httpAgent;

var util = require('util');

var request = P.promisify(require('request'));

function getOptions(uri, o, method) {
    if (!o || o.constructor !== Object) {
        if (uri) {
            if (typeof uri === 'object') {
                o = uri;
            } else {
                o = { uri: uri };
            }
        } else {
            throw new Error('preq options missing!');
        }
    } else {
        o.uri = uri;
    }
    o.method = method;
    if (o.body && o.body instanceof Object) {
        if (o.headers && /^application\/json/.test(o.headers['content-type'])) {
            o.body = JSON.stringify(o.body);
        } else if (o.method === 'post') {
            o.form = o.body;
            o.body = undefined;
        }
    }

    if ((o.method === 'get' || o.method === 'put')
            && o.retries === undefined) {
        // Idempotent methods: Retry by default
        o.retries = 5;
    }

    if (o.query) {
        o.qs = o.query;
        o.query = undefined;
    }

    // Set a timeout by default
    if (o.timeout === undefined) {
        o.timeout = 1 * 60 * 1000; // 1 minute
    }

    // Default pool options: Don't limit the number of sockets
    if (!o.pool) {
        o.pool = {maxSockets: Infinity};
    }

    if (o.gzip === undefined && o.method === 'get') {
        o.gzip = true;
    }
    return o;
}

/*
 * Error instance wrapping HTTP error responses
 *
 * Has the same properties as the original response.
 */
function HTTPError(response) {
    Error.call(this);
    Error.captureStackTrace(this, HTTPError);
    this.name = this.constructor.name;
    this.message = response.status.toString();
    if (response.body && response.body.type) {
        this.message += ': ' + response.body.type;
    }

    for (var key in response) {
        this[key] = response[key];
    }
}
util.inherits(HTTPError, Error);


/*
 * Encapsulate the state associated with a single HTTP request
 */
function Request (method, url, options) {
    this.options = getOptions(url, options, method);
    this.retries = this.options.retries;
    this.timeout = this.options.timeout;
    this.delay = 50; // start with 50ms
}

Request.prototype.retry = function (err) {
    if (this.retries) {
        var res = P
        .bind(this)
        .delay(this.delay)
        .then(this.run);
        this.retries--;
        // exponential backoff, but start with a short delay
        this.delay *= 2;
        // grow the timeout linearly
        this.timeout += this.options.timeout;
        return res;
    } else {
        throw err;
    }
};

Request.prototype.run = function () {
    var self = this;
    return P.try(request, this.options)
    .bind(this)
    .then(function(responses) {
        if (!responses || responses.length < 2) {
            return this.retry(new HTTPError({
                status: 500,
                body: {
                    type: 'empty_response',
                }
            }));
        } else {
            var response = responses[0];
            var body = responses[1]; // decompressed
            if (body && response.headers &&
                    /^application\/(?:problem\+)?json\b/.test(response.headers['content-type'])) {
                body = JSON.parse(body);
            }

            var res = {
                status: response.statusCode,
                headers: response.headers,
                body: body
            };

            if (res.status >= 400) {
                throw new HTTPError(res);
            } else {
                return res;
            }
        }
    },
    function (err) {
        return this.retry(new HTTPError({
            status: 500,
            body: {
                type: 'internal_http_error',
                description: err.toString(),
                error: err,
                stack: err.stack,
                uri: self.options.uri,
                method: self.options.method,
            },
            stack: err.stack
        }));
    });
};

var preq = function preq (url, options) {
    var method = (options || url || {}).method || 'get';
    return new Request(method, url, options).run();
};

var methods = ['get','head','put','post','delete','trace','options','mkcol','patch'];
methods.forEach(function(method) {
    preq[method] = function (url, options) {
        return new Request(method, url, options).run();
    };
});

module.exports = preq;
