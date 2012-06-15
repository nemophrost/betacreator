goog.provide('bc.uuid');


/* GENERIC UTILITY FUNCTIONS
============================================================================= */

/**
 * @param {?string=} existing
 * @return {string}
 */
bc.uuid = function(existing) {
	// add to cache if we have an existing id
	if (existing) {
		bc.uuid.cache[existing] = true;
		return existing;
	}
	
	var uuid = bc.uuid.get();
	// if the new uuid is not used, add and return it
	if (!bc.uuid.cache[uuid])
		return bc.uuid(uuid);
	// if it is already used, try again;
	else
		return bc.uuid();
}

bc.uuid.cache = {};

/**
 * http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript
 * @return {string}
 */
bc.uuid.get = function() {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		return v.toString(16);
	});
}
