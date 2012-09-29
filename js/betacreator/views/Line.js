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

goog.require('bc.view.Item');
goog.require('bc.model.Line');
goog.require('bc.math');
goog.require('bc.object');
goog.require('bc.color');
goog.require('bc.render.DashedLine');
goog.require('goog.dom');
goog.require('goog.array');

/**
 * @param {bc.model.Line} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Line = function(model) {
	this.model = model;
	this.padding = 10;
	
	/** @type {?Object} */
	this.drawProperties = null;
	/** @type {?Object} */
	this.locationProperties = null;
	
	this.canvas = goog.dom.createElement('canvas');
	this.canvas.width = 2*this.padding;
	this.canvas.height = 2*this.padding;
	this.canvas.style.position = 'absolute';
};



/**
 * @param {CanvasRenderingContext2D} context
 * @param {string=} color
 * @param {number=} lineWidth
 * 
 * @private
 */
bc.view.Line.prototype._draw = function(context, color, lineWidth) {
	var me = this,
		scale = this.model.scale(),
		isDashed = this.model.offLength() > 0;
	
	context.strokeStyle = color || this.model.color();
	context.lineWidth = lineWidth || this.model.lineWidth()*scale;
	
	/** @type {CanvasRenderingContext2D|bc.render.DashedLine} */
	var ctx = isDashed ? new bc.render.DashedLine(context, this.model.onLength()*scale, this.model.offLength()*scale) : context;
	
	ctx.beginPath();
	
	if (this.model.curved()) {
		var cps = this.model.controlPoints();
		var cpLength = cps.length;
		goog.array.forEach(cps, function(cp, i) {
			// for first point, just move to it
			if (i == 0) {
				ctx.moveTo(cp.x, cp.y);
			}
			else {
				var prevCP = cps[i - 1];
				
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
		goog.array.forEach(this.model.controlPoints(), function(cp, i) {
			// for first point, just move to it
			if (i == 0)
				ctx.moveTo(cp.x, cp.y);
			// for every other points just lineTo it
			else
				ctx.lineTo(cp.x, cp.y);
		});
	}
	
	ctx.stroke();

	if (isDashed)
		ctx.destroy();
};

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
		this._draw(ctx, 'rgba(255,0,0,0.75)', this.model.lineWidth()*this.model.scale() + 4);
		ctx.restore();
	}
	else {
		ctx.save();
		this._draw(ctx, bc.color.highContrastWhiteOrBlack(this.model.color(), .5), this.model.lineWidth()*this.model.scale() + 2);
		ctx.restore();
	}

	this._draw(ctx);
	ctx.restore();
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * 
 * @private
 */
bc.view.Line.prototype.drawControlPoints = function(ctx) {
	var me = this,
		strokeColor = this.model.color(),
		shadowColor = bc.color.highContrastWhiteOrBlack(strokeColor, .5),
		r = 7;
	
	ctx.save();
	
	goog.array.forEach(this.model.controlPoints(), function(cp, i) {
		ctx.beginPath();
		ctx.moveTo(cp.x + r, cp.y);
		ctx.arc(cp.x,cp.y,r,0,2*Math.PI,false);
		ctx.strokeStyle = shadowColor;
		ctx.lineWidth = 6;
		ctx.stroke();
		ctx.strokeStyle = strokeColor;
		ctx.lineWidth = 4;
		ctx.stroke();
	});
	
	ctx.restore();
};

/**
 * @param {number=} scale
 * @private
 */
bc.view.Line.prototype.updateLocation = function(scale) {
	scale = scale || 1;
	
	this.canvas.style.left = Math.round(scale*(this.model.offset.x + this.model.bb.x) - this.padding) + 'px';
	this.canvas.style.top = Math.round(scale*(this.model.offset.y + this.model.bb.y) - this.padding) + 'px';
};



/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @param {number=} scale
 * @param {boolean=} selected
 * @param {number=} mode
 */
bc.view.Line.prototype.render = function(scale, selected, mode) {
	scale = scale || 1;

	var drawProperties = this.model.serializeParams();
	drawProperties.scale = scale;
	drawProperties.selected = !!selected;
	drawProperties.mode = mode || null;
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;
		
		this.model.updateBoundingBox();
		this.model.updatePoints();
		
		var ctx = this.canvas.getContext('2d'),
			canvasWidth = Math.round(scale*this.model.bb.w) + 2*this.padding,
			canvasHeight = Math.round(scale*this.model.bb.h) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.save();
		ctx.translate(this.padding - Math.round(scale*this.model.bb.x), this.padding - Math.round(scale*this.model.bb.y));
		ctx.scale(scale, scale);
		
		this.draw(ctx, selected);

		if (selected && mode == bc.Client.modes.LINE_EDIT)
			this.drawControlPoints(ctx);
		
		ctx.restore();
	}

	var locationProperties = {
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		x: this.model.bb.x,
		y: this.model.bb.y,
		w: this.model.bb.w,
		h: this.model.bb.h
	};
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(scale);
	}
};

bc.view.Line.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};
