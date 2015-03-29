var preq = require('../index');
var assert = require('assert');

// mocha defines to avoid JSHint breakage
/* global describe, it, before, beforeEach, after, afterEach */

describe('preq', function() {
    it('should retry', function() {
        this.timeout(20000);
        var tStart = new Date();
        return preq.get({
            // Some unreachable port
            uri: 'http://localhost:1/',
            retries: 6
        })
        .catch(function(e) {
            assert.equal(e.status, 500);
            var tDelta = new Date() - tStart;
            if (tDelta < 3150) {
                throw new Error("Does not look as if this actually retried!");
            }
        });
    });
    it('get google.com', function() {
        return preq.get({
            // Some unreachable port
            uri: 'http://google.com/',
            retries: 2
        })
        .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(!!res.body, true);
        });
    });
    it('get google.com with query', function() {
        return preq.get({
            uri: 'http://google.com/',
            query: {
                q: 'foo'
            }
        })
        .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(!!res.body, true);
        });
    });
    it('get google.com, simple constructor style', function() {
        return preq('http://google.com/')
        .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(!!res.body, true);
        });
    });
    it('get google.com with query, constructor style', function() {
        return preq({
            method: 'get',
            uri: 'http://google.com/',
            query: {
                q: 'foo'
            }
        })
        .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(!!res.body, true);
        });
    });
});

