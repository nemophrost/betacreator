goog.provide('bc.array');


/**
 * Runs a function on each item in an array until one returns false
 * @param {?Array} a
 */
bc.array.map = function(a, f) {
	if(!a)
		return;
	
	var aLen = a.length;
	for(var i = 0; i < aLen; i++) {
		if(f(a[i], i) == false)
			break;
	}
}

/**
 * Returns the first non-null non-undefined non-NaN item in the array or null
 * @param {Array} a
 * @return {*}
 */
bc.array.coalesce = function(a) {
	var aLen = a.length;
	for(var i = 0; i < aLen; i++) {
		if (!!a[i] || a[i] === 0 || a[i] === '' || a[i] === false)
			return a[i];
	}

	return null;
}
