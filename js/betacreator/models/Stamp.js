/**
 *  Copyright 2012 Alma Madsen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

goog.provide('bc.model.Stamp');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * @param {Object=} params
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Stamp = function(params) {
	params = params || {};

	this.type = null;
	this.id = bc.uuid(params.id);
	this.scale = params.scale || 1;
	this.color = params.color || '#ffff00';
	this.alpha = params.alpha || 1;
	this.lineWidth = params.lineWidth || 3;
	this.x = params.x || 0;
	this.y = params.y || 0;
	this.w = params.w || 20;
	this.h = params.h || 20;
	
	this.offset = new bc.math.Point(0,0);
};

/**
 * Apply the offset and return the result
 * 
 * @return {Object}
 */
bc.model.Stamp.prototype.applyOffset = function() {
	var ret = {
		x: this.x + this.offset.x,
		y: this.y + this.offset.y
	};
	
	this.offset.x = 0;
	this.offset.y = 0;

	return ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Stamp.parseParams = function(params) {
	params = params || {};
	
	return {
		type:	params['t'],
		scale:	params['s'],
		color:	params['c'],
		alpha:	params['a'],
		x:		params['x'],
		y:		params['y'],
		w:		params['w'],
		h:		params['h']
	};
};

/**
 * Set an offset for the stamp
 * @param {bc.math.Point} p
 */
bc.model.Stamp.prototype.setOffset = function(p) {
	this.offset = p;
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.serializeParams = function() {
	return {
		't': this.type,
		's': this.scale,
		'c': this.color,
		'a': this.alpha,
		'x': this.x,
		'y': this.y,
		'w': this.w,
		'h': this.h
	};
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.getActionParams = function() {
	return {
		scale: this.scale,
		color: this.color,
		alpha: this.alpha,
		x: this.x,
		y: this.y,
		w: this.w,
		h: this.h
	};
};

/**
 * @param {Object} params
 */
bc.model.Stamp.prototype.setActionParams = function(params) {
	if (params.scale !== undefined)
		this.scale = params.scale;
	if (params.color !== undefined)
		this.color = params.color;
	if (params.alpha !== undefined)
		this.alpha = params.alpha;
	if (params.x !== undefined)
		this.x = params.x;
	if (params.y !== undefined)
		this.y = params.y;
	if (params.w !== undefined)
		this.w = params.w;
	if (params.h !== undefined)
		this.h = params.h;
};
