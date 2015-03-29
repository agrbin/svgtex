function safeGetValueFromPropertyOnObject(obj, property) {
	if (obj.hasOwnProperty(property)) {
		try {
			return obj[property];
		}
		catch (err) {
			return '[Throws]'
		}
	}

	return obj[property];
}

function ensureProperties(obj) {
	var seen = []; // store references to objects we have seen before

	function visit(obj) {
		if (typeof obj !== 'object') {
			return obj;
		}

		var result = {}; // we do not want to mutate the input object

		Object.keys(obj).forEach(function(prop) {
			// prevent faulty defined getter properties
			var value = safeGetValueFromPropertyOnObject(obj, prop);

			if (typeof value === 'object') {
				// prevent circular references
				if (seen.indexOf(value) === -1) {
					seen.push(value);
					result[prop] = visit(value);
				}
				else {
					result[prop] = '[Circular]';
				}
			}
			else {
				result[prop] = value;
			}
		});

		return result;
	};

	return visit(obj);
}

module.exports = function(data) {
	return JSON.stringify(ensureProperties(data));
}

module.exports.ensureProperties = ensureProperties;
