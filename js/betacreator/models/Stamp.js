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

	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = null;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || 1;
	this.properties[bc.properties.ITEM_COLOR] = params.color || '#ffff00';
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || 1;
	this.properties[bc.properties.ITEM_LINEWIDTH] = params.lineWidth || 3;
	this.properties[bc.properties.ITEM_X] = params.x || 0;
	this.properties[bc.properties.ITEM_Y] = params.y || 0;
	this.properties[bc.properties.ITEM_W] = params.w || 18;
	this.properties[bc.properties.ITEM_H] = params.h || 18;
	this.properties[bc.properties.TEXT] = params.text || '';
	
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.lineWidth = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_LINEWIDTH));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.w = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_W));
	this.h = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_H));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	
	this.offset = new goog.math.Coordinate(0,0);
};

/**
 * Apply the offset and return the result
 * 
 * @return {Object}
 */
bc.model.Stamp.prototype.applyOffset = function() {
	var ret = {
		x: this.x() + this.offset.x,
		y: this.y() + this.offset.y
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
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		lineWidth:	params[bc.properties.ITEM_LINEWIDTH],
		x:			params[bc.properties.ITEM_X],
		y:			params[bc.properties.ITEM_Y],
		w:			params[bc.properties.ITEM_W],
		h:			params[bc.properties.ITEM_H],
		text:		params[bc.properties.TEXT]
	};
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Stamp.prototype.setOffset = function(p) {
	this.offset.x = p.x;
	this.offset.y = p.y;
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.getActionParams = function() {
	return {
		scale: this.scale(),
		color: this.color(),
		alpha: this.alpha(),
		x: this.x(),
		y: this.y(),
		w: this.w(),
		h: this.h(),
		text: this.text()
	};
};

/**
 * @param {Object} params
 */
bc.model.Stamp.prototype.setActionParams = function(params) {
	if (params.scale !== undefined)
		this.scale(params.scale);
	if (params.color !== undefined)
		this.color(params.color);
	if (params.alpha !== undefined)
		this.alpha(params.alpha);
	if (params.x !== undefined)
		this.x(params.x);
	if (params.y !== undefined)
		this.y(params.y);
	if (params.w !== undefined)
		this.w(params.w);
	if (params.h !== undefined)
		this.h(params.h);
	if (params.text !== undefined)
		this.text(params.text);
};
