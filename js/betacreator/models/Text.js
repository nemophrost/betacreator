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

goog.provide('bc.model.Text');

goog.require('bc.model.Item');
goog.require('bc.uuid');

/**
 * @param {Object=} params
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Text = function(params) {
	params = params || {};

	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.TEXT;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || 1;
	this.properties[bc.properties.ITEM_COLOR] = params.color || '#ffff00';
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || 1;
	this.properties[bc.properties.ITEM_X] = params.x || 0;
	this.properties[bc.properties.ITEM_Y] = params.y || 0;
	this.properties[bc.properties.TEXT] = params.text || '';
	this.properties[bc.properties.TEXT_ALIGN] = params.textAlign || 'l';
	
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	this.textAlign = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_ALIGN));
	
	this.offset = new goog.math.Coordinate(0,0);

	/** @type {Array.<bc.TextLine>} */
	this.lines = [];
};

/** @typedef {{text:string, top:number, size:number, width:number, bold:boolean, italic:boolean}} */
bc.TextLine;

/**
 * Apply the offset and return the result
 * 
 * @return {Object}
 */
bc.model.Text.prototype.applyOffset = function() {
	var ret = {
		x: this.x() + this.offset.x,
		y: this.y() + this.offset.y
	};
	
	this.offset.x = 0;
	this.offset.y = 0;

	return ret;
};

/**
 * @return {Array.<bc.TextLine>}
 */
bc.model.Text.prototype.calculateLines = function() {
	var defaultSize = 12,
		defaultLineSpacing = 1.5,
		lines = goog.string.trimRight(this.text()).replace(/\n\r/g, '\n').replace(/\r/g, '\n').replace(/\t/g, '    ').split('\n'),
		offset = 0,
		ret = [];

	goog.array.forEach(lines, function(line, i) {
		ret.push({
			text: line,
			top: offset,
			size: defaultSize,
			width: -1,
			bold: false,
			italic: false
		});

		offset += defaultLineSpacing*defaultSize;
	});

	return this.lines = ret;
};

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Text.parseParams = function(params) {
	params = params || {};
	
	return {
		type:		params[bc.properties.ITEM_TYPE],
		scale:		params[bc.properties.ITEM_SCALE],
		color:		params[bc.properties.ITEM_COLOR],
		alpha:		params[bc.properties.ITEM_ALPHA],
		x:			params[bc.properties.ITEM_X],
		y:			params[bc.properties.ITEM_Y],
		text:		params[bc.properties.TEXT],
		textAlign:		params[bc.properties.TEXT_ALIGN]
	};
};

/**
 * Set an offset for the stamp
 * @param {goog.math.Coordinate} p
 */
bc.model.Text.prototype.setOffset = function(p) {
	this.offset.x = p.x;
	this.offset.y = p.y;
};

/**
 * @return {Object}
 */
bc.model.Text.prototype.serializeParams = function() {
	var ret = {};

	for (var key in this.properties) {
		ret[key] = this.properties[key];
	}

	return ret;
};

/**
 * @return {Object}
 */
bc.model.Text.prototype.getActionParams = function() {
	return {
		scale: this.scale(),
		color: this.color(),
		alpha: this.alpha(),
		x: this.x(),
		y: this.y(),
		text: this.text(),
		textAlign: this.textAlign()
	};
};

/**
 * @param {Object} params
 */
bc.model.Text.prototype.setActionParams = function(params) {
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
	if (params.text !== undefined)
		this.text(params.text);
	if (params.textAlign !== undefined)
		this.text(params.textAlign);
};

/**
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
bc.model.Text.prototype.hitTest = function(x,y) {
	var scale = this.scale();
	for(var i = 0, l = this.lines.length; i < l; i++) {
		if(this.lines[i].width > -1 &&
				x >= this.x() &&
				x <= this.x() + this.lines[i].width*scale &&
				y >= this.y() + this.lines[i].top*scale &&
				y <= this.y() + (i+1 < l ? this.lines[i+1].top : (this.lines[i].top + this.lines[i].size))*scale
			) {
			return true;
		}
	}
	return false;
};
