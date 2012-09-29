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

goog.provide('bc.view.stamp.Anchor');

goog.require('bc.model.stamp.Anchor');
goog.require('bc.view.Stamp');

/**
 * @param {bc.model.stamp.Anchor} model
 *
 * @constructor
 * @extends {bc.view.Stamp}
 */
bc.view.stamp.Anchor = function(model) {
	bc.view.Stamp.call(this, model);
	
	// reassign the model here to make the compiler knows what type the model is.
	/** @type {bc.model.stamp.Anchor} */
	this.model = model;
};
goog.inherits(bc.view.stamp.Anchor, bc.view.Stamp);

/**
 * @inheritDoc
 */
bc.view.stamp.Anchor.prototype.draw = function(ctx, color, lineWidth) {
	ctx.strokeStyle = color || this.model.color();
	ctx.lineWidth = lineWidth || this.model.lineWidth();
	ctx.beginPath();
	ctx.moveTo(0,0);
	ctx.lineTo(this.model.w(),this.model.h());
	ctx.moveTo(this.model.w(),0);
	ctx.lineTo(0,this.model.h());
	
	var startAngle = 0,
		r = Math.min(this.model.w(),this.model.h())/2;

	ctx.moveTo(this.model.w()/2 + r*Math.cos(startAngle), this.model.h()/2 + r*Math.sin(startAngle));
	ctx.arc(this.model.w()/2,this.model.h()/2,r,startAngle,Math.PI*2,false);

	ctx.stroke();
};
