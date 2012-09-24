goog.provide('bc.array');


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
