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

goog.provide('bc.model.Anchor');

goog.require('bc.model.Stamp');

/**
 * @param {Object=} params
 *
 * @constructor
 * @extends {bc.model.Stamp}
 */
bc.model.Anchor = function(params) {
	params = params || {};
	bc.model.Stamp.call(this, params);
	
	this.type = 'anchor';
    this.scale = params.scale || 1;
    this.color = params.color || '#000000';
    this.alpha = params.alpha || 1;
}
goog.inherits(bc.model.Anchor, bc.model.Stamp);

/**
 * @param {CanvasRenderingContext2D} ctx
 */
bc.model.Anchor.prototype.draw = function(ctx) {
   	ctx.fillStyle = '#ffffff';
   	ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(this.w,this.h);
    ctx.moveTo(this.w,0);
    ctx.lineTo(0,this.h);
	
	var startAngle = 0,
		r = Math.min(this.w,this.h)/2;
    ctx.moveTo(this.w/2 + r*Math.cos(startAngle), this.h/2 + r*Math.sin(startAngle));
    ctx.arc(this.w/2,this.h/2,r,startAngle,Math.PI*2,false);

    ctx.stroke();
}
