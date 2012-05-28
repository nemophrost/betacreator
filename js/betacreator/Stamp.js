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

goog.provide('bc.model.Stamp');

/**
 * @param {Object=} params
 * @constructor
 */
bc.model.Stamp = function(params) {
	params = params || {};
	
	this.type = null;
    this.scale = params.scale || 1;
    this.color = params.color || '#ffff00';
    this.alpha = params.alpha || 1;
    this.x = params.x || 0;
    this.y = params.y || 0;
    this.w = params.w || 20;
    this.h = params.h || 20;
	
	this.padding = 10;
	
	this.canvas = $('<canvas width="' + (this.w + 2*this.padding) + '" + height="' + (this.h + 2*this.padding) + '"></canvas>')
		.css({ 'position': 'absolute' });
}

/**
 * @param {Object} params
 * @return {Object}
 */
bc.model.Stamp.parseParams = function(params) {
	params = params || {};
	
	return {
		type:	params['t'],
		scale:	params['s'],
		color:	params['c'],
		alpha:	params['a'],
		x:		params['x'],
		y:		params['y'],
		w:		params['w'],
		h:		params['h']
	};
}

/**
 * @return {Object}
 */
bc.model.Stamp.prototype.serializeParams = function() {
	return {
		't': this.type,
		's': this.scale,
		'c': this.color,
		'a': this.alpha,
		'x': this.x,
		'y': this.y,
		'w': this.w,
		'h': this.h
	};
}

/**
 * @param {CanvasRenderingContext2D} ctx
 */
bc.model.Stamp.prototype.draw = function(ctx) {}

/**
 * @param {number=} pageScale
 */
bc.model.Stamp.prototype.updateLocation = function(pageScale) {
	pageScale = pageScale || 1;
	
	var scale = pageScale*this.scale,
		canvasWidth = Math.round(scale*this.w) + 2*this.padding,
		canvasHeight = Math.round(scale*this.h) + 2*this.padding;
	
	this.canvas.css({
		'left': Math.round(pageScale*this.x - canvasWidth/2) + 'px',
		'top': Math.round(pageScale*this.y - canvasHeight/2) + 'px'
	});
}

/**
 * @param {number=} pageScale
 */
bc.model.Stamp.prototype.render = function(pageScale) {
	pageScale = pageScale || 1;
	
	// get total scale (individual scale of stamp times page scale)
	var scale = pageScale*this.scale;
	
	var drawProperties = {
		w: this.w,
		h: this.h,
		color: this.color,
		alpha: this.alpha,
		scale: scale
	};
	
	var locationProperties = {
		x: this.x,
		y: this.y,
		w: this.w,
		h: this.h,
		scale: scale
	}
	
	// if something has changed since last rendering that will affect rendering, 
	// redraw the stamp
	if (!bc.object.areEqual(drawProperties, this.drawProperties)) {
		this.drawProperties = drawProperties;
		
		var ctx = this.canvas.get(0).getContext('2d'),
			canvasWidth = Math.round(scale*this.w) + 2*this.padding,
			canvasHeight = Math.round(scale*this.h) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.save();
		ctx.translate(this.padding, this.padding);
		ctx.scale(scale, scale);
		
		this.draw(ctx);
		
		ctx.restore();
	}
	
	// if the location or size has changed, update the location
	if (!bc.object.areEqual(locationProperties, this.locationProperties)) {
		this.locationProperties = locationProperties;

		this.updateLocation(pageScale);
	}
}
