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
 * @param {?Object=} params
 * @param {Object=} defaults
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.stamp.Piton = function(params, defaults) {
	params = params || {};

	if (!params.w)
		params.w = 12;
	if (!params.h)
		params.h = 12;

	bc.model.Stamp.call(this, params, defaults);
	
	this.type(bc.model.ItemTypes.PITON);
};
goog.inherits(bc.model.stamp.Piton, bc.model.Stamp);

/**
 * @param {number} x
 * @param {number} y
 * @param {boolean=} selected
 * @return {boolean}
 */
bc.model.stamp.Piton.prototype.hitTest = function(x,y,selected) {
	var dist = this.lineWidth()*this.scale()/2 + 1,
		w = this.w()*this.scale(),
		h = this.h()*this.scale();

	// if the point is outside the bounding box return early
	if (Math.abs(x - this.x()) > w/2 + dist || Math.abs(y - this.y()) > h/2 + dist)
		return false;

	var leftEdge = this.x() - 0.1*w,
		pBottom = this.y() + 0.1*h;

	if (x < leftEdge - dist || (x > leftEdge + dist && y > pBottom + dist))
		return false;

	return true;
};
