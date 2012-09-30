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
 *
 *  The DashedLine class provides a means to draw with standard drawing
 *  methods but allows you to draw using dashed lines. Dashed lines are continuous
 *  between drawing commands so dashes won't be interrupted when new lines
 *  are drawn in succession
 *
 *  This code is a conversion of Trevor McCauley's ActionScript 3 DashedLine class
 */
 
goog.provide('bc.render.DashedLine');

goog.require('bc.math');

/**
 * @param {CanvasRenderingContext2D} context The canvas context to draw the line on.
 * @param {number} onLength Length of visible dash lines.
 * @param {number} offLength Length of space between dash lines.
 *
 * @constructor
 */
bc.render.DashedLine = function(context, onLength, offLength) {
	
	/**
	 * The target context in which drawings are to be made
	 * @type {CanvasRenderingContext2D}
	 */
	this.ctx = context;
	/**
	 * A value representing the accuracy used in determining the length
	 * of curveTo curves.
	 *
	 * @type {number}
	 */
	this._curveaccuracy = 6;
	
	/**
	 * @type {boolean}
	 * @private
	 */
	this.isLine = true;
	/**
	 * @type {number}
	 * @private
	 */
	this.overflow = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.offLength = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.onLength = 0;
	/**
	 * @type {number}
	 * @private
	 */
	this.dashLength = 0;
	/**
	 * @type {Object}
	 * @private
	 */
	this.pen = null;
	
	
	this.setDash(onLength, offLength);
	this.isLine = true;
	this.overflow = 0;
	this.pen = {x:0, y:0};
};


// public methods
/**
* Sets new lengths for dash sizes
* @param {number} onLength Length of visible dash lines.
* @param {number} offLength Length of space between dash lines.
*/
bc.render.DashedLine.prototype.setDash = function(onLength, offLength) {
	this.onLength = onLength;
	this.offLength = offLength;
	this.dashLength = this.onLength + this.offLength;
};

/**
* Gets the current lengths for dash sizes
*
* @return {Array.<number>} Array containing the onLength and offLength values
* respectively in that order
*/
bc.render.DashedLine.prototype.getDash = function() {
	return [this.onLength, this.offLength];
};

/**
* Moves the current drawing position in target to (x, y).
*
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.moveTo = function(x, y) {
	this.ctxMoveTo(x, y);
};

/**
* Draws a dashed line in target using the current line style from the current drawing position
* to (x, y); the current drawing position is then set to (x, y).
*
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.lineTo = function(x,y) {
	var dx = x-this.pen.x,	dy = y-this.pen.y;
	var a = Math.atan2(dy, dx);
	var ca = Math.cos(a), sa = Math.sin(a);
	var segLength = bc.math.Line.lineLength(0, 0, dx, dy);
	
	if (this.overflow){
		if (this.overflow > segLength){
			if (this.isLine) this.ctxLineTo(x, y);
			else this.ctxMoveTo(x, y);
			this.overflow -= segLength;
			
			return;
		}
		
		if (this.isLine)
			this.ctxLineTo(this.pen.x + ca*this.overflow, this.pen.y + sa*this.overflow);
		else
			this.ctxMoveTo(this.pen.x + ca*this.overflow, this.pen.y + sa*this.overflow);
		
		segLength -= this.overflow;
		this.overflow = 0;
		this.isLine = !this.isLine;
		
		if (!segLength)
			return;
	}
	
	var fullDashCount = Math.floor(segLength/this.dashLength);
	
	if (fullDashCount){
		var onx = ca*this.onLength,	ony = sa*this.onLength;
		var offx = ca*this.offLength, offy = sa*this.offLength;
		for (var i=0; i<fullDashCount; i++) {
			if (this.isLine){
				this.ctxLineTo(this.pen.x+onx, this.pen.y+ony);
				this.ctxMoveTo(this.pen.x+offx, this.pen.y+offy);
			}
			else{
				this.ctxMoveTo(this.pen.x+offx, this.pen.y+offy);
				this.ctxLineTo(this.pen.x+onx, this.pen.y+ony);
			}
		}
		segLength -= this.dashLength*fullDashCount;
	}
	
	if (this.isLine){
		if (segLength > this.onLength){
			this.ctxLineTo(this.pen.x+ca*this.onLength, this.pen.y+sa*this.onLength);
			this.ctxMoveTo(x, y);
			this.overflow = this.offLength-(segLength-this.onLength);
			this.isLine = false;
		}
		else{
			this.ctxLineTo(x, y);
			if (segLength == this.onLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else{
				this.overflow = this.onLength-segLength;
				this.ctxMoveTo(x, y);
			}
		}
	}
	else{
		if (segLength > this.offLength){
			this.ctxMoveTo(this.pen.x+ca*this.offLength, this.pen.y+sa*this.offLength);
			this.ctxLineTo(x, y);
			this.overflow = this.onLength-(segLength-this.offLength);
			this.isLine = true;
		}
		else{
			this.ctxMoveTo(x, y);
			if (segLength == this.offLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else {
				this.overflow = this.offLength-segLength;
			}
		}
	}
};

/**
* Draws a dashed curve in target using the current line style from the current drawing position to
* (x, y) using the control point specified by (cx, cy). The current  drawing position is then set
* to (x, y).
*
* @param {number} cx Control point x
* @param {number} cy Control point y
* @param {number} x
* @param {number} y
*/
bc.render.DashedLine.prototype.quadraticCurveTo = function(cx, cy, x, y) {
	/**@type {number} */
	var sx = this.pen.x;
	/**@type {number} */
	var sy = this.pen.y;
	/**@type {number} */
	var segLength = bc.math.Line.curveLength(sx, sy, cx, cy, x, y, this._curveaccuracy);
	/**@type {number} */
	var t = 0;
	/**@type {number} */
	var t2 = 0;
	/**@type {Array.<number>} */
	var c;
	
	if (this.overflow){
		if (this.overflow > segLength){
			if (this.isLine) this.ctxCurveTo(cx, cy, x, y);
			else this.ctxMoveTo(x, y);
			this.overflow -= segLength;
			return;
		}
		
		t = this.overflow/segLength;
		c = bc.math.Line.curveSliceUpTo(sx, sy, cx, cy, x, y, t);
		
		if (this.isLine)
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
		else
			this.ctxMoveTo(c[4], c[5]);
		
		this.overflow = 0;
		this.isLine = !this.isLine;
		
		if (!segLength)
			return;
	}
	
	var remainLength = segLength - segLength*t;
	var fullDashCount = Math.floor(remainLength/this.dashLength);
	var ont = this.onLength/segLength;
	var offt = this.offLength/segLength;
	
	if (fullDashCount){
		for (var i=0; i<fullDashCount; i++){
			if (this.isLine){
				t2 = t + ont;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxCurveTo(c[2], c[3], c[4], c[5]);
				t = t2;
				t2 = t + offt;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxMoveTo(c[4], c[5]);
			}
			else{
				t2 = t + offt;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxMoveTo(c[4], c[5]);
				t = t2;
				t2 = t + ont;
				c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
				this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			}
			t = t2;
		}
	}
	
	remainLength = segLength - segLength*t;
	
	if (this.isLine){
		if (remainLength > this.onLength){
			t2 = t + ont;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			this.ctxMoveTo(x, y);
			this.overflow = this.offLength-(remainLength-this.onLength);
			this.isLine = false;
		}
		else{
			c = bc.math.Line.curveSliceFrom(sx, sy, cx, cy, x, y, t);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);
			if (segLength == this.onLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else{
				this.overflow = this.onLength-remainLength;
				this.ctxMoveTo(x, y);
			}
		}
	}
	else{
		if (remainLength > this.offLength){
			t2 = t + offt;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			this.ctxMoveTo(c[4], c[5]);
			c = bc.math.Line.curveSliceFrom(sx, sy, cx, cy, x, y, t2);
			this.ctxCurveTo(c[2], c[3], c[4], c[5]);

			this.overflow = this.onLength-(remainLength-this.offLength);
			this.isLine = true;
		}
		else{
			this.ctxMoveTo(x, y);
			if (remainLength == this.offLength){
				this.overflow = 0;
				this.isLine = !this.isLine;
			}
			else {
				this.overflow = this.offLength-remainLength;
			}
		}
	}
};

// direct translations
/**
* Begin path
*/
bc.render.DashedLine.prototype.beginPath = function() {
	this.ctx.beginPath();
};

/**
* Apply Stroke
*/
bc.render.DashedLine.prototype.stroke = function() {
	this.ctx.stroke();
};

/**
* Clears the drawing
*
* @param {number} x
* @param {number} y
* @param {number} w
* @param {number} h
*/
bc.render.DashedLine.prototype.clearRect = function(x,y,w,h) {
	this.ctx.clearRect(x,y,w,h);
};

/**
* Sets the lineStyle for target
* @param {number} thickness A number that indicates the thickness of the line in points
* @param {string} rgb A hex color value (for example, red is #FF0000, blue is #0000FF, and so on) of
* the line. If a value is not indicated, JavaScript uses #000000 (black).
*/
bc.render.DashedLine.prototype.lineStyle = function(thickness,rgb) {
	this.ctx.lineWidth = thickness;
	this.ctx.strokeStyle = rgb;
};

/**
* Destroy the Dashed Line instance
*/
bc.render.DashedLine.prototype.destroy = function() {
	this.ctx = null;
	this.pen = null;
};

/**
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxMoveTo = function(x, y) {
	this.pen = {x:x, y:y};
	this.ctx.moveTo(x, y);
};

/**
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxLineTo = function(x, y) {
	if (x == this.pen.x && y == this.pen.y)
		return;
	
	this.pen = {x:x, y:y};
	this.ctx.lineTo(x, y);
};

/**
 * @param {number} cx
 * @param {number} cy
 * @param {number} x
 * @param {number} y
 *
 * @private
 */
bc.render.DashedLine.prototype.ctxCurveTo = function(cx, cy, x, y) {
	if (cx == x && cy == y && x == this.pen.x && y == this.pen.y)
		return;
	
	this.pen = {x:x, y:y};
	this.ctx.quadraticCurveTo(cx, cy, x, y);
};
