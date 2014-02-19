#!/usr/bin/env node
/**
 * A very basic cluster-based server runner. Restarts failed workers, but does
 * not much else right now.
 */

var cluster = require('cluster');

if (cluster.isMaster) {
	// Start a few more workers than there are cpus visible to the OS, so that we
	// get some degree of parallelism even on single-core systems. A single
	// long-running request would otherwise hold up all concurrent short requests.
	var numCPUs = require('os').cpus().length + 3;
	// Fork workers.
	for (var i = 0; i < numCPUs; i++) {
		cluster.fork();
	}

	cluster.on('exit', function(worker) {
		if (!worker.suicide) {
			var exitCode = worker.process.exitCode;
			console.log('worker', worker.process.pid,
									'died ('+exitCode+'), restarting.');
			cluster.fork();
		}
	});

	process.on('SIGTERM', function() {
		console.log('master shutting down, killing workers');
		var workers = cluster.workers;
		Object.keys(workers).forEach(function(id) {
				console.log('Killing worker ' + id);
				workers[id].destroy();
		});
		console.log('Done killing workers, bye');
		process.exit(1);
	} );
} else {
	var mathoidWorker = require('./mathoid-worker.js');
	process.on('SIGTERM', function() {
		console.log('Worker shutting down');
		process.exit(1);
	});
	// when running on appfog.com the listen port for the app
	// is passed in an environment variable.  Most users can ignore this!
	mathoidWorker.listen(process.env.MATHOID_PORT || 10042);
}
