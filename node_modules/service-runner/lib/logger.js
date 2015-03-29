"use strict";
var P = require('bluebird');
var extend = require('extend');
var bunyan = require('bunyan');
var gelf_stream = require('gelf-stream');


// Simple bunyan logger wrapper
function Logger (confOrLogger, args) {
    if (confOrLogger.constructor !== Logger) {
        // Create a new root logger
        var conf = this._processConf(confOrLogger);
        this._logger = bunyan.createLogger(conf);
        var level = conf && conf.level || 'warn';
        this._levelMatcher = this._levelToMatcher(level);

        // Set up handlers for uncaught extensions
        this._setupRootHandlers();
    } else {
        this._logger = confOrLogger._logger;
        this._levelMatcher = confOrLogger._levelMatcher;
    }
    this.args = args;
}

Logger.prototype._processConf = function(conf) {
    if (Array.isArray(conf.streams)) {
        var streams = [];
        conf.streams.forEach(function(stream) {
            if (stream.type === 'gelf') {
                // Convert the 'gelf' logger type to a real logger
                streams.push({
                    type: 'raw',
                    stream: gelf_stream.forBunyan(stream.host,
                        stream.port, stream.options)
                });
            } else {
                streams.push(stream);
            }
        });
        conf = extend({}, conf);
        conf.streams = streams;
    }
    return conf;
};

Logger.prototype._setupRootHandlers = function() {
    var self = this;
    // Avoid recursion if there are bugs in the logging code.
    var inLogger = false;
    function logUnhandledException (err) {
        if (!inLogger) {
            inLogger = true;
            self.log('fatal/service-runner/unhandled', err);
            inLogger = false;
        }
    }

    // Catch unhandled rejections & log them. This relies on bluebird.
    P.onPossiblyUnhandledRejection(logUnhandledException);

    // Similarly, log uncaught exceptions. Also, exit.
    process.on('uncaughtException', function(err) {
        logUnhandledException(err);
        process.exit(1);
    });
};

var levels = ['trace','debug','info','warn','error','fatal'];
Logger.prototype._levelToMatcher = function _levelToMatcher (level) {
    var pos = levels.indexOf(level);
    if (pos !== -1) {
        return new RegExp('^(' + levels.slice(pos).join('|') + ')(?=\/|$)');
    } else {
        // Match nothing
        return /^$/;
    }
};

Logger.prototype.child = function (args) {
    var newArgs = extend({}, this.args, args);
    return new Logger(this, newArgs);
};

Logger.prototype.log = function (level, info) {
    var levelMatch = this._levelMatcher.exec(level);
    if (levelMatch) {
        var logger = this._logger;
        var simpleLevel = levelMatch[1];
        if (info && info instanceof String) {
            info = {msg: info};
        }
        if (info && typeof info === 'object') {
            // Got an object
            //
            // Inject the detailed levelpath.
            // 'level' is already used for the numeric level.
            info.levelPath = level;

            // Also pass in default parameters
            info = extend(info, this.args);
        }
        logger[simpleLevel].call(logger, info);
    }
};


module.exports = Logger;
