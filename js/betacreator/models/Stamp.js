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

/**
 * @param {Object=} params
 * @constructor
 */
bc.model.Stamp = function(params) {
	params = params || {};

	this.type = null;
	this.scale = params.scale || 1;
	this.color = params.color || '#ffff00';
	this.alpha = params.alpha || 1;
	this.lineWidth = params.lineWidth || 3;
	this.x = params.x || 0;
	this.y = params.y || 0;
	this.w = params.w || 20;
	this.h = params.h || 20;
}

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
}

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
}
