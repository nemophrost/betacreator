goog.provide('bc.ClassSet');

/**
 * @param {Element} e
 * @constructor
 */
bc.ClassSet = function(e) {
	this.el = e;
	
	this.classes = {};
	
	var classAr = this.el.className.split(' ');
	for(var i = 0, l = classAr.length; i < l; i++)
		this.classes[classAr[i]] = true;
};

/**
 * @return {string}
 * @private
 */
bc.ClassSet.prototype.getClassName = function() {
	var ret = [];
	for(var key in this.classes)
		ret.push(key);
	return ret.join(' ');
};

/**
 * @param {string} name
 */
bc.ClassSet.prototype.addClass = function(name) {
	var all = name.split(' ');
	for(var i = 0, l = all.length; i < l; i++)
		this.classes[all[i]] = true;
	this.el.className = this.getClassName();
};

/**
 * @param {string} name
 */
bc.ClassSet.prototype.removeClass = function(name) {
	var all = name.split(' ');
	for(var i = 0, l = all.length; i < l; i++)
		delete this.classes[all[i]];
	this.el.className = this.getClassName();
};
