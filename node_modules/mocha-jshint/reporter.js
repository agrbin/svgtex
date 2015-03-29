var path = require('path');
module.exports = function (err) {
	return function (results) {
		results.forEach(function (result) {
			var file = result.file;
			var error = result.error;
			if (err.message) {
				err.stack += '\n';
			}
			err.message = err.message || 'jshint error' + (results.length > 1 ? 's' : '');
			err.stack += error.reason +
				(error.code ? ' (' + error.code + ')' : '') +
				'\n at (' + path.resolve(file) + ':' + error.line + ':' + error.character + ')';
		});
	};
};