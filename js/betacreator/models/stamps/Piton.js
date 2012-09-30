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
goog.provide('bc.model.stamp.Piton');

goog.require('bc.model.Stamp');

/**
 * @param {Object=} params
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Piton = function(params) {
	params = params || {};

	if (!params.w)
		params.w = 12;
	if (!params.h)
		params.h = 12;

	bc.model.Stamp.call(this, params);
	
	this.type(bc.model.ItemTypes.PITON);
};
goog.inherits(bc.model.stamp.Piton, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
bc.model.stamp.Piton.prototype.hitTest = function(x,y) {
	var dist = this.lineWidth()/2 + 1;

	if (goog.math.Coordinate.distance(
			new goog.math.Coordinate(x, y),
			new goog.math.Coordinate(this.x(), this.y())
		) <= this.w()/2 + dist)
		return true;

	return false;
};
