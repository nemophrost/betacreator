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
