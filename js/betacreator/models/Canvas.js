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

goog.provide('bc.model.Canvas');

goog.require('bc.property');
goog.require('goog.array');

/**
 * @param {bc.controller.Canvas} controller
 * @param {Image} image
 * @constructor
 */
bc.model.Canvas = function(controller, image) {
	var me = this;
	
	this.controller = controller;
	this.image = image;
	
	this.h = image.height;
	this.w = image.width;

	this.scale = 1;

	this.scales = [1/8, 1/6, 1/4, 1/3, 1/2, 2/3, 1, 2, 3, 4, 5, 6, 7, 8, 12, 16];
	
	/** @type {Array.<bc.model.Item>} */
	this.items = [];

	/** @type {Object} */
	this.properties = {};
	this.properties[bc.properties.ITEM_SCALE] = 1;
	this.properties[bc.properties.ITEM_COLOR] = '#ffff00';
	this.properties[bc.properties.ITEM_ALPHA] = 1;
	this.properties[bc.properties.LINE_ONLENGTH] = 10;
	this.properties[bc.properties.LINE_OFFLENGTH] = 10;
	this.properties[bc.properties.LINE_CURVED] = false;
	this.properties[bc.properties.TEXT_ALIGN] = 'l';
	this.properties[bc.properties.TEXT_BG] = false;

	this.tempLine = new bc.model.Line({
		controlPoints: [ new goog.math.Coordinate(0,0) ]
	}, this.properties);

	this.addItem(this.tempLine);
};


/********************************************************************
*********************************************************************
**
**  Public methods
**
*********************************************************************
********************************************************************/

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.addItem = function(item) {
	this.items.push(item);
};

/**
 * @param {bc.model.Item} item
 */
bc.model.Canvas.prototype.removeItem = function(item) {
	goog.array.remove(this.items, item);
};

/**
 * @param {string} id
 * @return {bc.model.Item|null}
 */
bc.model.Canvas.prototype.getItem = function(id) {
	return /** @type {bc.model.Item|null} */(goog.array.find(this.items, function(item) {
		return item.id == id;
	}));
};

/**
 * Call the function f with each item in order, top down (newest first). If any call to f returns true, stop the looping
 *
 * @param {function(bc.model.Item)} f
 * @param {boolean=} selectedFirst If this is set to true then we cycle through selected items first, then the rest top down
 */
bc.model.Canvas.prototype.eachOrderedItem = function(f, selectedFirst) {
	if (selectedFirst) {
		goog.array.some(this.controller.getSelectedItems(), function(item) {
			return !!f(item);
		});
	}

	for (var i = this.items.length - 1; i >= 0; i--) {
		if (selectedFirst && this.controller.isItemSelected(this.items[i]))
			continue;

		if (f(this.items[i]) === true)
			return;
	}
};

bc.model.Canvas.prototype.zoomOut = function() {
	for (var i = 0, l = this.scales.length; i < l; i++) {
		if (goog.math.nearlyEquals(this.scales[i], this.scale)) {
			this.scale = this.scales[goog.math.clamp(i - 1, 0, l - 1)];
			return;
		}
		else if (this.scale > this.scales[i] && (!this.scales[i+1] || this.scale < this.scales[i+1])) {
			this.scale = this.scales[i];
			return;
		}
	}
};

bc.model.Canvas.prototype.zoomIn = function() {
	for (var i = 0, l = this.scales.length; i < l; i++) {
		if (goog.math.nearlyEquals(this.scales[i], this.scale)) {
			this.scale = this.scales[goog.math.clamp(i + 1, 0, l - 1)];
			return;
		}
		else if (this.scale > this.scales[i] && this.scales[i+1] && this.scale < this.scales[i+1]) {
			this.scale = this.scales[i+1];
			return;
		}
	}
};
