goog.provide('bc.object');
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
 * Runs a function on each item in an object until one returns false
 * @param {Object} o
 */
bc.object.map = function(o, f) {
	if(!o)
		return;
	
	for(var i in o) {
		if (f(i, o[i]) == false)
			break;
	}
}

/**
 * Creates a deep copy of an object
 * @param {*} dupeObj The object to copy
 * @param {number=} level Not passed in by the user
 * @return {Object|Array} A deep copy of o
 */
bc.object.copy = function(dupeObj, level) {
	if(dupeObj == null)
		return null;
	
	if(level == null)
		level = 0;
	if(level > 100) {
		return null;
	}
	
    var retObj = {};
    if (typeof(dupeObj) == 'object') {
        if (typeof(dupeObj.length) != 'undefined')
            retObj = [];
        for (var objInd in dupeObj) {   
			var type = typeof(dupeObj[objInd]);
            if (type == 'object') {
				if(dupeObj[objInd] instanceof HTMLElement)
					retObj[objInd] = dupeObj[objInd];
				else
					retObj[objInd] = pt.object.copy(dupeObj[objInd], level+1);
            } else if (type == 'string') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'number') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'function') {
                retObj[objInd] = dupeObj[objInd];
            } else if (type == 'boolean') {
                ((dupeObj[objInd] == true) ? retObj[objInd] = true : retObj[objInd] = false);
            } else if (type == 'undefined') {
				retObj[objInd] = undefined;
			}
        }
    }
    return retObj;
}

/**
 * Are these two objects actually equivalent, or not?
 * @param {*} first
 * @param {*} second
 * 
 * @return {boolean}
 */
bc.object.areEqual = function(first, second) {
	if(typeof(first) == 'object' && typeof(second) == 'object') {
		if(first == null && second == null)
			return true;
		else if(goog.isArray(first) && goog.isArray(second)) {
			if(first.length != second.length)
				return false;

			for(var i = 0; i < first.length; i++) {
				if(!lucid.object.areEqual(first[i], second[i]))
					return false;
			}

			return true;
		}
		else if(goog.isObject(first) && goog.isObject(second)) {
			for(var key in first) {
				//Skip items in the prototype.
				if(key in (first.__proto__ || first.constructor) || key == '__proto__')
					continue;

				if(!(key in second))
					return false;
				if(!lucid.object.areEqual(first[key], second[key]))
					return false;
			}

			for(var key in second) {
				//Skip items in the prototype.
				if(key in (second.__proto__ || second.constructor) || key == '__proto__')
					continue;

				if(!(key in first))
					return false;
			}

			return true;
		}
		else
			return false;
	}
	else if(goog.isNumber(first) && goog.isNumber(second))
		return Math.abs(first-second) < 0.000000001;
	else if(first == null && second == null)
		return true;
	else
		return first === second;
}
