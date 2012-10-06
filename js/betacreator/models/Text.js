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
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @implements {bc.model.Item}
 */
bc.model.Text = function(params, defaults) {
	params = params || {};

	this.id = bc.uuid(params.id);

	this.properties = {};
	this.properties[bc.properties.ITEM_TYPE] = bc.model.ItemTypes.TEXT;
	this.properties[bc.properties.ITEM_SCALE] = params.scale || defaults[bc.properties.ITEM_SCALE];
	this.properties[bc.properties.ITEM_COLOR] = params.color || defaults[bc.properties.ITEM_COLOR];
	this.properties[bc.properties.ITEM_ALPHA] = params.alpha || defaults[bc.properties.ITEM_ALPHA];
	this.properties[bc.properties.ITEM_X] = params.x || 0;
	this.properties[bc.properties.ITEM_Y] = params.y || 0;
	this.properties[bc.properties.TEXT] = params.text || '';
	this.properties[bc.properties.TEXT_ALIGN] = params.textAlign || defaults[bc.properties.TEXT_ALIGN];
	this.properties[bc.properties.TEXT_BG] = params.textBG || defaults[bc.properties.TEXT_BG];
	
	this.type = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_TYPE));
	this.scale = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_SCALE));
	this.color = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_COLOR));
	this.alpha = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_ALPHA));
	this.x = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_X));
	this.y = /** @type {function(number=):number} */(bc.property.getterSetter(this.properties, bc.properties.ITEM_Y));
	this.text = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT));
	this.textAlign = /** @type {function(string=):string} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_ALIGN));
	this.textBG = /** @type {function(boolean=):boolean} */(bc.property.getterSetter(this.properties, bc.properties.TEXT_BG));
	
	this.actionProperties = [
		bc.properties.ITEM_SCALE,
		bc.properties.ITEM_COLOR,
		bc.properties.ITEM_ALPHA,
		bc.properties.ITEM_X,
		bc.properties.ITEM_Y,
		bc.properties.TEXT,
		bc.properties.TEXT_ALIGN,
		bc.properties.TEXT_BG
	];

	this.offset = new goog.math.Coordinate(0,0);

	/**
	 * @type {?goog.math.Coordinate}
	 * @private
	 */
	this.boundingBox = null;

	/**
	 * @type {number}
	 * @private
	 */
	this.boundingBoxPadding = 0;

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
	var ret = {};

	ret[bc.properties.ITEM_X] = this.x() + this.offset.x;
	ret[bc.properties.ITEM_Y] = this.y() + this.offset.y;
	
	this.offset.x = 0;
	this.offset.y = 0;

	return ret;
};

/**
 * Sets the size of the bounding box (x == w, y == h)
 *
 * @param {goog.math.Coordinate} bbSize
 * @param {number} bbPad
 */
bc.model.Text.prototype.setBoundingBox = function(bbSize, bbPad) {
	this.boundingBox = bbSize;
	this.boundingBoxPadding = bbPad;
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
		textAlign:		params[bc.properties.TEXT_ALIGN],
		textBG:		params[bc.properties.TEXT_BG]
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
	var me = this,
		ret = {};

	goog.array.forEach(this.actionProperties, function(key) {
		ret[key] = me.properties[key];
	});

	return ret;
};

/**
 * @param {Object} params
 */
bc.model.Text.prototype.setActionParams = function(params) {
	var me = this;
	goog.array.forEach(this.actionProperties, function(key) {
		if (params[key] !== undefined)
			me.properties[key] = params[key];
	});
};

/**
 * For text we hit test agains each line so we could put other items in the white space if we want
 *
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.Text.prototype.hitTest = function(x,y,selected) {
	if (!this.boundingBox)
		return false;

	var scale = this.scale(),
		ta = this.textAlign(),
		bb = new bc.math.Box(this.x(), this.y(), this.boundingBox.x*this.scale(), this.boundingBox.y*this.scale()),
		pad = (this.textBG() || selected) ? this.boundingBoxPadding : 0;

	if (ta == 'c')
		bb.x -= bb.w/2;
	else if (ta == 'r')
		bb.x -= bb.w;

	// if we are outside the bounding box (with padding), return early
	if (Math.abs(x - bb.x - bb.w/2) > bb.w/2 + pad || Math.abs(y - bb.y - bb.h/2) > bb.h/2 + pad) {
		return false;
	}

	// if we are in the box (which we have to be to get here) and text bg is on or the item is selected, return true.
	if (this.textBG() || selected) {
		return true;
	}
	else {
		var lw = 0; // line width
		for(var i = 0, l = this.lines.length; i < l; i++) {
			lw = this.lines[i].width*scale;
			if( lw > -1 &&
				x >= bb.x + (ta == 'c' ? bb.w/2 - lw/2 : (ta == 'r' ? bb.w - lw : 0)) &&
				x <= bb.x + (ta == 'c' ? bb.w/2 + lw/2 : (ta == 'r' ? bb.w : lw)) &&
				y >= bb.y + this.lines[i].top*scale &&
				y <= bb.y + (i+1 < l ? this.lines[i+1].top : (this.lines[i].top + this.lines[i].size))*scale
			) {
				return true;
			}
		}
	}

	return false;
};
