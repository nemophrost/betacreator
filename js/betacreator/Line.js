goog.provide('bc.model.Line');

goog.require('bc.math');
goog.require('bc.array');
goog.require('bc.object');
goog.require('bc.render.DashedLine');

/**
 * @param {Object=} params
 * @constructor
 */
bc.model.Line = function(params) {
	params = params || {};
	
    this.color = params.color || '#ffff00';
    this.alpha = params.alpha || 1;
	this.lineWidth = params.lineWidth || 3;
    this.controlPoints = params.controlPoints || [];
	this.isDashed = params.isDashed || false;
	this.onLength = params.onLength || 10;
	this.offLength = params.offLength || 10;
	this.curved = params.curved || false;
	
	this.padding = 10;
	this.offset = new bc.math.Point(0,0);
	
	this.points = this.getPoints();
	
	this.canvas = $('<canvas width="' + (2*this.padding) + '" + height="' + (2*this.padding) + '"></canvas>')
		.css({ 'position': 'absolute' });
}

/**
 * @private
 */
bc.model.Line.prototype.updateBoundingBox = function() {
	if (this.controlPoints.length == 0) {
		this.bb = null;
		return;
	}
	
	var minX = Number.MAX_VALUE,
		maxX = Number.MIN_VALUE,
		minY = Number.MAX_VALUE,
		maxY = Number.MIN_VALUE;
	
	bc.array.map(this.controlPoints, function(point) {
		minX = Math.min(minX, point.x);
		maxX = Math.max(maxX, point.x);
		minY = Math.min(minY, point.y);
		maxY = Math.max(maxY, point.y);
	});
	
	this.bb = new bc.math.Box(minX, minY, maxX - minX, maxY - minY);
}

/**
 * @param {CanvasRenderingContext2D} context
 * @param {string=} color
 * @param {number=} lineWidth
 * 
 * @private
 */
bc.model.Line.prototype._draw = function(context, color, lineWidth) {
	var me = this;
	
	context.strokeStyle = color || this.color;
	context.lineWidth = lineWidth || this.lineWidth;
	
	/** @type {CanvasRenderingContext2D|bc.render.DashedLine} */
	var ctx = this.isDashed ? new bc.render.DashedLine(context, this.onLength, this.offLength) : context;
	
	ctx.beginPath();
	
	if (this.curved) {
		var cpLength = this.controlPoints.length;
		bc.array.map(this.controlPoints, function(cp, i) {
			// for first point, just move to it
			if (i == 0) {
				ctx.moveTo(cp.x, cp.y);
			}
			else {
				var prevCP = me.controlPoints[i - 1];
				
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
		bc.array.map(this.controlPoints, function(cp, i) {
			// for first point, just move to it
			if (i == 0)
				ctx.moveTo(cp.x, cp.y);
			// for every other points just lineTo it
			else
				ctx.lineTo(cp.x, cp.y);
		});
	}
	
	ctx.stroke();

	if (this.isDashed)
		ctx.destroy();
}

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {boolean=} selected
 * 
 * @private
 */
bc.model.Line.prototype.draw = function(ctx, selected) {
	ctx.save();
	ctx.lineCap = 'round';
	
	if (selected) {
		ctx.save();
		this._draw(ctx, 'palegoldenrod', this.lineWidth + 10);
		ctx.restore();
	}
	else {
		ctx.save();
		this._draw(ctx, '#ffffff', this.lineWidth + 2);
		ctx.restore();
	}

	this._draw(ctx);
	ctx.restore();
}

/**
 * @param {number=} scale
 * @private
 */
bc.model.Line.prototype.updateLocation = function(scale) {
	scale = scale || 1;
	
	this.canvas.css({
		'left': Math.round(scale*(this.offset.x + this.bb.x) - this.padding) + 'px',
		'top': Math.round(scale*(this.offset.y + this.bb.y) - this.padding) + 'px'
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
 * @param {Object} params
 * @return {Object}
 */
bc.model.Line.parseParams = function(params) {
	params = params || {};
	
	var ret = {
		color:			params['c'],
		alpha:			params['a'],
		lineWidth:		params['lw'],
		isDashed:		params['d'],
		onLength:		params['n'],
		offLength:		params['f']
	};
	
	if (params['cp'] && goog.isArray(params['cp'])) {
		var cp = [];
		bc.array.map(params['cp'], function(point) {
			cp.push(new bc.math.Point(point['x'], point['y']));
		});
		ret.controlPoints = cp;
	}
	
	return ret;
}

/**
 * @return {Object}
 */
bc.model.Line.prototype.serializeParams = function() {
	var ret = {
		'c':	this.color,
		'a':	this.alpha,
		'lw':	this.lineWidth,
		'd':	this.isDashed
	};
	
	if (this.isDashed) {
		ret['n'] = this.onLength;
		ret['f'] = this.offLength;
	}
	
	var cp = [];
	bc.array.map(this.controlPoints, function(point) {
		cp.push({
			'x': point.x,
			'y': point.y
		});
	});
	ret['cp'] = cp;
	
	return ret;
}

/**
 */
bc.model.Line.prototype.applyOffset = function() {
	if (this.offset.x == 0 && this.offset.y == 0)
		return;
	
	var cp = [];
	
	bc.array.map(this.controlPoints, function(point) {
		cp.push(new bc.math.Point(point.x + this.offset.x, point.y + this.offset.y));
	});
	
	this.controlPoints = cp;
	this.points = this.getPoints();
	this.offset.x = 0;
	this.offset.y = 0;
}

/**
 * @param {number=} scale
 * @param {boolean=} selected
 */
bc.model.Line.prototype.render = function(scale, selected) {
	scale = scale || 1;

	var drawProperties = this.serializeParams();
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
		
		this.updateBoundingBox();
		this.points = this.getPoints();
		
		var ctx = this.canvas.get(0).getContext('2d'),
			canvasWidth = Math.round(scale*this.bb.w) + 2*this.padding,
			canvasHeight = Math.round(scale*this.bb.h) + 2*this.padding;
		
		ctx.canvas.width = canvasWidth;
		ctx.canvas.height = canvasHeight;
		
		ctx.clearRect(0, 0, canvasWidth, canvasHeight);
		
		ctx.save();
		ctx.translate(this.padding - Math.round(scale*this.bb.x), this.padding - Math.round(scale*this.bb.y));
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

/**
 * @param {number} x
 * @param {number} y
 * @return {boolean}
 */
bc.model.Line.prototype.hitTest = function(x,y) {
	var p = this.points;
	for(var i = 0, l = p.length - 1; i < l; i++) {
		if(bc.math.distanceFromLineSegment(new bc.math.Point(x,y),p[i],p[i+1]) < 10) {
			return true;
		}
	}
	return false;
}


/**
 * Get all the points for the line (used in hit test)
 * 
 * @return {Array.<bc.math.Point>}
 */
bc.model.Line.prototype.getPoints = function() {
	
	var me = this;
	
	/** @type {Array.<bc.math.Point>} */
	var ret = [];
	
	var pointDistance = 10;
	
	if (this.curved) {
		var cpLength = this.controlPoints.length;
		bc.array.map(this.controlPoints, function(cp, i) {
			// for first point, just move to it
			if (i == 0) {
				ret.push(new bc.math.Point(cp.x, cp.y));
			}
			else {
				var prevCP = me.controlPoints[i - 1];
				
				// for second point just add a point at half way between it and 
				// the first
				if (i == 1)
					ret.push(new bc.math.Point((cp.x + prevCP.x)/2, (cp.y + prevCP.y)/2));
				// for every other points, get the points for the curve from the 
				// previous half-way pointto the current half-way point
				else
					ret = ret.concat(me.getCurvePoints(
							ret[ret.length-1].x,
							ret[ret.length-1].y,
							prevCP.x,
							prevCP.y,
							(cp.x + prevCP.x)/2,
							(cp.y + prevCP.y)/2,
							pointDistance
						));
				
				// if it's the last point, add it
				if (i == cpLength - 1)
					ret.push(new bc.math.Point(cp.x, cp.y));
			}
		});
	}
	else {
		bc.array.map(this.controlPoints, function(cp, i) {
			ret.push(new bc.math.Point(cp.x, cp.y));
		});
	}
	
	return ret;
}

/**
* Draws a dashed curve in target using the current line style from the current drawing position to
* (x, y) using the control point specified by (cx, cy). The current  drawing position is then set
* to (x, y).
* 
* @param {number} sx start x
* @param {number} sy start y
* @param {number} cx Control point x
* @param {number} cy Control point y
* @param {number} x
* @param {number} y
* 
* @return {Array.<bc.math.Point>}
*/
bc.model.Line.prototype.getCurvePoints = function(sx, sy, cx, cy, x, y, pointDistance) {
	/** @type {Array.<bc.math.Point>} */
	var ret = [];
	
	/** @type {number} */
	var segLength = bc.math.Line.curveLength(sx, sy, cx, cy, x, y);
	/** @type {number} */
	var t = 0;
	/** @type {number} */
	var t2 = 0;
	/** @type {Array.<number>} */
	var c;
	
	var remainLength = segLength;
	var fullDashCount = Math.floor(remainLength/pointDistance);
	var ont = pointDistance/segLength;
	
	if (fullDashCount){
		for (var i=0; i<fullDashCount; i++){
			t2 = t + ont;
			c = bc.math.Line.curveSlice(sx, sy, cx, cy, x, y, t, t2);
			ret.push(new bc.math.Point(c[4], c[5]));
			t = t2;
		}
		
		ret.push(new bc.math.Point(x, y));
	}
	
	return ret;
}
