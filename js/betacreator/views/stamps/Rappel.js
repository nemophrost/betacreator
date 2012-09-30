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

goog.provide('bc.view.stamp.Rappel');

goog.require('bc.model.stamp.Rappel');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Rappel} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Rappel = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Rappel} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Rappel, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Rappel.prototype.draw = function(ctx, color, lineWidth) {
	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	
	var startAngle = 0,
		w = this.model.w(),
		h = this.model.h(),
		r = Math.min(this.model.w(),this.model.h())/2;

	ctx.moveTo(w/2 + r*Math.cos(startAngle), h/2 + r*Math.sin(startAngle));
	ctx.arc(w/2,h/2,r,startAngle,Math.PI*2,false);

	// draw the arrow
	ctx.moveTo(w/2,0.25*h);
	ctx.lineTo(w/2,0.75*h);
	ctx.moveTo(0.25*w,h/2);
	ctx.lineTo(w/2,0.75*h);
	ctx.lineTo(0.75*w,h/2);

	ctx.stroke();
};
