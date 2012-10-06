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
goog.provide('bc.model.stamp.Anchor');

goog.require('bc.model.Stamp');

/**
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Anchor = function(params, defaults) {
	params = params || {};
	
	if (!params.w)
		params.w = 10;
	if (!params.h)
		params.h = 10;

	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.ANCHOR);
};
goog.inherits(bc.model.stamp.Anchor, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Anchor.prototype.hitTest = function(x,y,selected) {
	var scale = this.scale(),
		w = this.w()*scale,
		h = this.h()*scale,
		dist = this.lineWidth()*scale/2 + 6;
	
	if(bc.math.distanceFromLineSegment(
			new goog.math.Coordinate(x,y),
			new goog.math.Coordinate(this.x() - w/2, this.y() - h/2),
			new goog.math.Coordinate(this.x() + w/2, this.y() + h/2)
		) < dist || bc.math.distanceFromLineSegment(
			new goog.math.Coordinate(x,y),
			new goog.math.Coordinate(this.x() + w/2, this.y() - h/2),
			new goog.math.Coordinate(this.x() - w/2, this.y() + h/2)
		) < dist) {
		return true;
	}

	return false;
};
