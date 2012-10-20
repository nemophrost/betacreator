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

goog.provide('bc.view.Stamp');

goog.require('bc.view.Item');
goog.require('bc.model.Stamp');
goog.require('bc.object');
goog.require('goog.dom');

/**
 * @param {bc.model.Stamp} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Stamp = function(model) {
	this.model = model;
	this.defaultPadding = 10;
	this.padding = this.defaultPadding;
	
	/** @type {?Object} */
	this.drawProperties = null;
	/** @type {?Object} */
	this.locationProperties = null;
	
	this.canvas = goog.dom.createElement(goog.dom.TagName.CANVAS);
	this.canvas.width = this.model.w() + 2*this.padding;
	this.canvas.height = this.model.h() + 2*this.padding;
	this.canvas.style.position = 'absolute';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string=} color
 * @param {number=} lineWidth
 * @protected
 */
bc.view.Stamp.prototype.draw = function(ctx, color, lineWidth) {};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Stamp.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.model.scale(),
		canvasWidth = Math.round(scale*this.model.w()) + 2*this.padding,
		canvasHeight = Math.round(scale*this.model.h()) + 2*this.padding;
	
	this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth/2) + 'px';
	this.canvas.style.top = Math.round(pageScale*(this.model.y() + this.model.offset.y) - canvasHeight/2) + 'px';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} scale
 * @param {boolean=} selected
 * @param {boolean=} directOnCanvas Skip resizing and clearing canvas if true
 * @private
 */
bc.view.Stamp.prototype._render  = function(ctx, scale, selected, directOnCanvas) {
	this.padding = this.defaultPadding*Math.max(1,scale);
		
	var canvasWidth = Math.round(scale*this.model.w()) + 2*this.padding,
		canvasHeight = Math.round(scale*this.model.h()) + 2*this.padding;
	
	if (!directOnCanvas) {
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
	}

	ctx.save();

	if (directOnCanvas)
		ctx.translate(Math.round(this.model.x() - canvasWidth/2), Math.round(this.model.y() - canvasHeight/2));
	
	ctx.translate(this.padding, this.padding);
	ctx.scale(scale, scale);
	ctx.lineCap = 'round';

	if (selected) {
		ctx.save();
		// this.draw(ctx, 'rgba(52,156,240,0.75)', this.model.lineWidth() + 4/scale);
		this.draw(ctx, 'rgba(255,0,0,0.75)', this.model.lineWidth() + 4/scale);
		ctx.restore();
	}
	
	ctx.save();
	this.draw(ctx, bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5), this.model.lineWidth() + 2/scale);
	ctx.restore();
	
	this.draw(ctx);
	
	ctx.restore();
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @inheritDoc
 */
bc.view.Stamp.prototype.render = function(pageScale, selected, mode) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.model.scale();
	
	var drawProperties = {
		w: this.model.w(),
		h: this.model.h(),
		color: this.model.color(),
		alpha: this.model.alpha(),
		scale: scale,
		selected: selected,
		text: this.model.text()
	};
	
	var locationProperties = {
		x: this.model.x(),
		y: this.model.y(),
		w: this.model.w(),
		h: this.model.h(),
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		scale: scale
	};
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;

		var ctx = this.canvas.getContext('2d');

		this._render(ctx, scale, selected);
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
};

/**
 * @inheritDoc
 */
bc.view.Stamp.prototype.renderToContext = function(ctx) {
	ctx.save();
	this._render(ctx, this.model.scale(), false, true);
	ctx.restore();
};

bc.view.Stamp.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};
