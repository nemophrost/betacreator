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

goog.provide('bc.view.Line');

goog.require('bc.model.Line');
goog.require('bc.math');
goog.require('bc.array');
goog.require('bc.object');
goog.require('bc.render.DashedLine');

/**
 * @param {bc.model.Line} model
 * @constructor
 */
bc.view.Line = function(model) {
	this.model = model;
	this.padding = 10;
	this.offset = new bc.math.Point(0,0);
	
	/** @type {?Object} */
	this.drawProperties = null;
	/** @type {?Object} */
	this.locationProperties = null;
	
	this.canvas = $('<canvas width="' + (2*this.padding) + '" + height="' + (2*this.padding) + '"></canvas>')
		.css({ 'position': 'absolute' });
}



/**
 * @param {CanvasRenderingContext2D} context
 * @param {string=} color
 * @param {number=} lineWidth
 * 
 * @private
 */
bc.view.Line.prototype._draw = function(context, color, lineWidth) {
	var me = this;
	
	context.strokeStyle = color || this.model.color;
	context.lineWidth = lineWidth || this.model.lineWidth;
	
	/** @type {CanvasRenderingContext2D|bc.render.DashedLine} */
	var ctx = this.model.isDashed ? new bc.render.DashedLine(context, this.model.onLength, this.model.offLength) : context;
	
	ctx.beginPath();
	
	if (this.model.curved) {
		var cpLength = this.model.controlPoints.length;
		bc.array.map(this.model.controlPoints, function(cp, i) {
			// for first point, just move to it
			if (i == 0) {
				ctx.moveTo(cp.x, cp.y);
			}
			else {
				var prevCP = me.model.controlPoints[i - 1];
				
				// for second point just draw a line to half way between it and 
				// the first
				if (i == 1)
					ctx.lineTo((cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2);
				// for every other points, draw a curve from the previous 
				// half-way pointto the current half-way point
				else
					ctx.quadraticCurveTo(prevCP.x, prevCP.y, (cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2);
				
				// if it's the last point, do a final lineTo
				if (i == cpLength - 1)
					ctx.lineTo(cp.x, cp.y);
			}
		});
	}
	else {
		bc.array.map(this.model.controlPoints, function(cp, i) {
			// for first point, just move to it
			if (i == 0)
				ctx.moveTo(cp.x, cp.y);
			// for every other points just lineTo it
			else
				ctx.lineTo(cp.x, cp.y);
		});
	}
	
	ctx.stroke();

	if (this.model.isDashed)
		ctx.destroy();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean=} selected
 * 
 * @private
 */
bc.view.Line.prototype.draw = function(ctx, selected) {
	ctx.save();
	ctx.lineCap = 'round';
	
	if (selected) {
		ctx.save();
		this._draw(ctx, 'palegoldenrod', this.model.lineWidth + 10);
		ctx.restore();
	}
	else {
		ctx.save();
		this._draw(ctx, '#ffffff', this.model.lineWidth + 2);
		ctx.restore();
	}

	this._draw(ctx);
	ctx.restore();
}

/**
 * @param {number=} scale
 * @private
 */
bc.view.Line.prototype.updateLocation = function(scale) {
	scale = scale || 1;
	
	this.canvas.css({
		'left': Math.round(scale*(this.offset.x + this.model.bb.x) - this.padding) + 'px',
		'top': Math.round(scale*(this.offset.y + this.model.bb.y) - this.padding) + 'px'
	});
}



/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 */
bc.view.Line.prototype.applyOffset = function() {
	if (this.offset.x == 0 && this.offset.y == 0)
		return;
	
	var cp = [];
	
	bc.array.map(this.model.controlPoints, function(point) {
		cp.push(new bc.math.Point(point.x + this.offset.x, point.y + this.offset.y));
	});
	
	this.model.controlPoints = cp;
	this.model.updatePoints();
	this.offset.x = 0;
	this.offset.y = 0;
}

/**
 * @param {number=} scale
 * @param {boolean=} selected
 */
bc.view.Line.prototype.render = function(scale, selected) {
	scale = scale || 1;

	var drawProperties = this.model.serializeParams();
	drawProperties.scale = scale;
	drawProperties.selected = !!selected;
	
	var locationProperties = {
		dx: this.offset.x,
		dy: this.offset.y
	}
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;
		
		this.model.updateBoundingBox();
		this.model.updatePoints();
		
		var ctx = this.canvas.get(0).getContext('2d'),
			canvasWidth = Math.round(scale*this.model.bb.w) + 2*this.padding,
			canvasHeight = Math.round(scale*this.model.bb.h) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.save();
		ctx.translate(this.padding - Math.round(scale*this.model.bb.x), this.padding - Math.round(scale*this.model.bb.y));
		ctx.scale(scale, scale);
		
		this.draw(ctx, selected);
		
		ctx.restore();
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(scale);
	}
}
