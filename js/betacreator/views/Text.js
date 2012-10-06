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

goog.provide('bc.view.Text');

goog.require('bc.view.Item');
goog.require('bc.model.Text');
goog.require('bc.object');
goog.require('goog.dom');

/**
 * @param {bc.model.Text} model
 * @constructor
 * @implements {bc.view.Item}
 */
bc.view.Text = function(model) {
	this.model = model;
	this.padding = 15;
	
	/** @type {?Object} */
	this.drawProperties = null;

	/** @type {?Object} */
	this.locationProperties = null;

	/** @type {?goog.math.Coordinate} */
	this.boundingBox = null;
	
	this.canvas = goog.dom.createElement(goog.dom.TagName.CANVAS);
	this.canvas.style.position = 'absolute';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {string=} strokeColor
 * @param {number=} strokeWidth
 * @private
 */
bc.view.Text.prototype.draw = function(ctx, strokeColor, strokeWidth) {
	var oneSize, oneBold, oneItalic,
		me = this,
		regular = strokeColor === undefined;

	switch (this.model.textAlign()) {
		case 'c':
			ctx.textAlign = 'center';
			break;
		case 'r':
			ctx.textAlign = 'right';
			break;
		default:
			ctx.textAlign = 'left';
			break;
	}
	ctx.textBaseline = 'top';
	ctx.fillStyle = this.model.color();
	ctx.strokeStyle = strokeColor || this.model.color();
	ctx.lineWidth = strokeWidth || 0;

	goog.array.forEach(this.model.lines, function(line, i) {
		if (oneSize != line.size || oneBold != line.bold || oneItalic != line.italic) {
			oneSize = line.size;
			oneBold = line.bold;
			oneItalic = line.italic;
			ctx.font = me.getFontStyle(line.italic, line.bold, line.size);
		}
		if (regular)
			ctx.fillText(line.text, 0, line.top);
		else
			ctx.strokeText(line.text, 0, line.top);
	});
};

/**
 * @param {boolean} italic
 * @param {boolean} bold
 * @param {number} size
 *
 * @return {string}
 * @private
 */
bc.view.Text.prototype.getFontStyle = function(italic, bold, size) {
	var font = '';

	if (italic)
		font += 'italic ';

	if (bold)
		font += 'bold ';

	return font + size + 'px Arial, Helvetica, sans-serif';
};

/**
 * @param {CanvasRenderingContext2D} ctx
 *
 * @return {goog.math.Coordinate}
 * @private
 */
bc.view.Text.prototype.calculateBoundingBox = function(ctx) {
	var me = this,
		maxWidth = 2048,
		w = 0;

	ctx.save();
	goog.array.forEach(this.model.lines, function(line, i) {
		ctx.font = me.getFontStyle(line.italic, line.bold, line.size);
		line.width = ctx.measureText(line.text).width;
		w = Math.min(maxWidth, Math.max(line.width, w));
	});
	ctx.restore();

	return new goog.math.Coordinate(w, this.model.lines[this.model.lines.length-1].top + this.model.lines[this.model.lines.length-1].size);
};

/**
 * @param {number=} pageScale
 * @private
 */
bc.view.Text.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.model.scale(),
		canvasWidth = Math.round(scale*this.boundingBox.x) + 2*this.padding,
		canvasHeight = Math.round(scale*this.boundingBox.y) + 2*this.padding;
	
	switch(this.model.textAlign()) {
		case 'c':
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth/2) + 'px';
			break;
		case 'r':
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - canvasWidth + this.padding) + 'px';
			break;
		default:
			this.canvas.style.left = Math.round(pageScale*(this.model.x() + this.model.offset.x) - this.padding) + 'px';
			break;
	}

	this.canvas.style.top = Math.round(pageScale*(this.model.y() + this.model.offset.y) - this.padding) + 'px';
};


/*******************************************************************************
 * 
 * 
 *                         PUBLIC METHODS
 * 
 * 
 ******************************************************************************/


/**
 * @param {number=} pageScale
 * @param {boolean=} selected
 * @param {number=} mode
 */
bc.view.Text.prototype.render = function(pageScale, selected, mode) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.model.scale();
	
	var drawProperties = {
		color: this.model.color(),
		alpha: this.model.alpha(),
		scale: scale,
		selected: selected,
		text: this.model.text(),
		textAlign: this.model.textAlign(),
		textBG: this.model.textBG()
	};
	
	var locationProperties = {
		x: this.model.x(),
		y: this.model.y(),
		dx: this.model.offset.x,
		dy: this.model.offset.y,
		scale: scale,
		textAlign: this.model.textAlign()
	};
	
	// if something has changed since last rendering that will affect rendering,
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;

		var ctx = this.canvas.getContext('2d');

		this.model.calculateLines();
		this.boundingBox = this.calculateBoundingBox(ctx);
		this.model.setBoundingBox(this.boundingBox, this.padding);

		var canvasWidth = Math.round(scale*this.boundingBox.x) + 2*this.padding,
			canvasHeight = Math.round(scale*this.boundingBox.y) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		ctx.save();

		if (this.model.textBG()) {
			ctx.save();
			ctx.fillStyle = bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5);
			ctx.fillRect(0, 0, canvasWidth, canvasHeight);
			ctx.restore();
		}
		if (selected) {
			ctx.save();
			ctx.strokeStyle = 'rgba(255,0,0,0.75)';
			ctx.lineWidth = 1;
			ctx.strokeRect(0.5, 0.5, canvasWidth-1, canvasHeight-1);
			ctx.restore();
		}

		switch(this.model.textAlign()) {
			case 'c':
				ctx.translate(canvasWidth/2, this.padding);
				break;
			case 'r':
				ctx.translate(canvasWidth - this.padding, this.padding);
				break;
			default:
				ctx.translate(this.padding, this.padding);
				break;
		}

		ctx.scale(scale, scale);
		ctx.lineCap = 'round';
		
		if (!this.model.textBG()) {
			ctx.save();
			this.draw(ctx, bc.color.highContrastWhiteOrBlack(this.model.color(), 0.5), 2/scale);
			ctx.restore();
		}
		
		this.draw(ctx);
		
		ctx.restore();
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
};


/**
 * @param {number=} pageScale
 * @param {boolean=} selected
 */
bc.view.Text.prototype.getPNG = function(pageScale, selected) {
	
};

bc.view.Text.prototype.destroy = function() {
	this.model = null;
	this.drawProperties = null;
	this.locationProperties = null;
	
	goog.dom.removeNode(this.canvas);
	this.canvas = null;
};
