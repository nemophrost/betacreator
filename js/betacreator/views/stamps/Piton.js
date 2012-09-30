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

goog.provide('bc.view.stamp.Piton');

goog.require('bc.model.stamp.Piton');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Piton} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Piton = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Piton} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Piton, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Piton.prototype.draw = function(ctx, color, lineWidth) {
	var w = this.model.w(),
		h = this.model.h(),
		r = 0.3*h;

	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	
	ctx.moveTo(0.4*w,h);
	ctx.lineTo(0.4*w,0);
	ctx.lineTo(w-r,0);
	ctx.arc(w-r,r,r,-Math.PI/2,Math.PI/2,false);
	ctx.lineTo(0.4*w,2*r);

	ctx.stroke();
};
