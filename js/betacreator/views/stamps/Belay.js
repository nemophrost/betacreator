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

goog.provide('bc.view.stamp.Belay');

goog.require('bc.model.stamp.Belay');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Belay} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Belay = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Belay} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Belay, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Belay.prototype.draw = function(ctx, color, lineWidth) {
	var regular = color === undefined,
		startAngle = 0,
		w = this.model.w(),
		h = this.model.h(),
		r = Math.min(w,h)/2;

	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();

	ctx.moveTo(w/2 + r*Math.cos(startAngle), h/2 + r*Math.sin(startAngle));
	ctx.arc(w/2,h/2,r,startAngle,Math.PI*2,false);

	ctx.stroke();

	if (this.model.text()) {
		ctx.font = '12px Arial, Helvetica, sans-serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		if (regular) {
			ctx.fillStyle = this.model.color();
			ctx.fillText(this.model.text(), w/2, h/2);
		}
		else {
			ctx.strokeStyle = color || this.model.color();
			ctx.lineWidth = Math.min(2, (lineWidth || this.model.lineWidth()) - this.model.lineWidth());
			ctx.strokeText(this.model.text(), w/2, h/2);
		}
	}
};
