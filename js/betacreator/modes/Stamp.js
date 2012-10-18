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
goog.provide('bc.mode.Stamp');

goog.require('bc.Mode');
goog.require('goog.math.Coordinate');

/**
 * @param {bc.controller.Canvas} canvas
 * @param {number} id
 *
 * @constructor
 * @extends {bc.Mode}
 */
bc.mode.Stamp = function(canvas, id) {
	bc.Mode.call(this, canvas, id);

	this.itemType = null;
};
goog.inherits(bc.mode.Stamp, bc.Mode);

/**
 * Called each time the mode is activated
 * @param {?number=} itemType
 */
bc.mode.Stamp.prototype.onActivate = function(itemType) {
	this.itemType = goog.isNumber(itemType) ? itemType : null;
};

/**
 * @inheritDoc
 */
bc.mode.Stamp.prototype.mouseDown = function(point) {
	if (this.itemType === null)
		return;

	this.canvas.runAction(new bc.model.Action(bc.model.ActionType.CreateStamp, {
		type: this.itemType,
		x: point.x,
		y: point.y
	}));
};

/**
 * @inheritDoc
 */
bc.mode.Stamp.prototype.getCursor = function() {
	return 'url(http://cdn1.iconfinder.com/data/icons/BRILLIANT/sports/png/24/ballooning.png) 12 12';
};
